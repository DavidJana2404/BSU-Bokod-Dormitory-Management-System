<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Carbon\Carbon;

class BackupController extends Controller
{
    /**
     * Display backup and restore page
     */
    public function index()
    {
        $user = auth()->user();
        
        // Only admin can access backups
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized access to backup system');
        }
        
        $backups = $this->getBackupsList();
        
        return Inertia::render('settings/backup', [
            'backups' => $backups,
        ]);
    }
    
    /**
     * Create a new database backup
     */
    public function create(Request $request)
    {
        $user = auth()->user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized access');
        }
        
        try {
            $backupDir = env('BACKUP_DIR', storage_path('app/backups'));
            
            Log::info('Starting backup creation', [
                'backup_dir' => $backupDir,
                'user' => $user->id
            ]);
            
            // Check if backup directory exists
            if (!file_exists($backupDir)) {
                // For local development, try to create it
                if (str_starts_with($backupDir, storage_path())) {
                    Log::info('Creating local backup directory', ['dir' => $backupDir]);
                    if (!mkdir($backupDir, 0755, true)) {
                        throw new \Exception('Failed to create backup directory: ' . $backupDir);
                    }
                } else {
                    // For Render persistent disk, it should already exist
                    throw new \Exception('Backup directory does not exist: ' . $backupDir . '. Please ensure the persistent disk is mounted and the directory is created.');
                }
            }
            
            // Check if directory is writable
            if (!is_writable($backupDir)) {
                throw new \Exception('Backup directory is not writable: ' . $backupDir . '. Please check directory permissions.');
            }
            
            // Use the backup script for Render/PostgreSQL
            $scriptPath = base_path('scripts/backup.sh');
            
            if (!file_exists($scriptPath)) {
                Log::error('Backup script not found', ['path' => $scriptPath]);
                throw new \Exception('Backup script not found at: ' . $scriptPath);
            }
            
            // Make script executable
            @chmod($scriptPath, 0755);
            
            // Set environment variables
            $databaseUrl = env('INTERNAL_DATABASE_URL') ?: env('DATABASE_URL');
            
            if (!$databaseUrl) {
                throw new \Exception('DATABASE_URL not configured');
            }
            
            Log::info('Executing backup script', [
                'script' => $scriptPath,
                'backup_dir' => $backupDir
            ]);
            
            // Check if bash is available
            exec('which bash 2>&1', $bashCheck, $bashCheckCode);
            $bashPath = $bashCheckCode === 0 && !empty($bashCheck) ? trim($bashCheck[0]) : '/bin/bash';
            
            Log::info('Bash path detected', ['bash_path' => $bashPath, 'check_code' => $bashCheckCode]);
            
            // Execute backup script with bash explicitly
            $command = sprintf(
                '%s %s 2>&1',
                $bashPath,
                escapeshellarg($scriptPath)
            );
            
            // Set environment variables
            $env = [
                'DATABASE_URL' => $databaseUrl,
                'BACKUP_DIR' => $backupDir,
            ];
            
            // Execute with environment variables
            $descriptorspec = [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ];
            
            $process = proc_open($command, $descriptorspec, $pipes, null, $env);
            
            if (!is_resource($process)) {
                throw new \Exception('Failed to start backup process');
            }
            
            fclose($pipes[0]);
            $output = stream_get_contents($pipes[1]);
            $errorOutput = stream_get_contents($pipes[2]);
            fclose($pipes[1]);
            fclose($pipes[2]);
            
            $returnCode = proc_close($process);
            $output = array_filter(explode("\n", $output . "\n" . $errorOutput));
            
            Log::info('Backup script executed', [
                'return_code' => $returnCode,
                'output' => $output
            ]);
            
            if ($returnCode !== 0) {
                $errorMessage = 'Backup script failed with code ' . $returnCode . ': ' . implode("\n", $output);
                Log::error('Backup script failed', [
                    'output' => $output,
                    'return_code' => $returnCode,
                    'command' => 'backup script execution'
                ]);
                throw new \Exception($errorMessage);
            }
            
            // Verify backup was created
            $files = scandir($backupDir);
            $backupFiles = array_filter($files, function($f) use ($backupDir) {
                return $f !== '.' && $f !== '..' && is_file($backupDir . '/' . $f);
            });
            
            if (empty($backupFiles)) {
                throw new \Exception('Backup completed but no backup file was created. Output: ' . implode("\n", $output));
            }
            
            Log::info('Backup created successfully', [
                'output' => $output,
                'user' => $user->id,
                'files' => $backupFiles
            ]);
            
            return redirect()->route('backup.index')
                ->with('success', 'Database backup created successfully!');
                
        } catch (\Exception $e) {
            $errorDetails = [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user' => $user->id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ];
            
            Log::error('Backup creation failed', $errorDetails);
            
            // Show detailed error in development/staging
            $errorMessage = 'Failed to create backup: ' . $e->getMessage();
            if (config('app.debug')) {
                $errorMessage .= ' (File: ' . $e->getFile() . ' Line: ' . $e->getLine() . ')';
            }
            
            return redirect()->route('backup.index')
                ->with('error', $errorMessage);
        }
    }
    
    /**
     * Download a backup file
     */
    public function download($filename)
    {
        $user = auth()->user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized access');
        }
        
        $backupDir = env('BACKUP_DIR', storage_path('app/backups'));
        $filePath = $backupDir . '/' . $filename;
        
        if (!file_exists($filePath)) {
            return redirect()->route('backup.index')
                ->with('error', 'Backup file not found.');
        }
        
        Log::info('Backup downloaded', ['file' => $filename, 'user' => $user->id]);
        
        return response()->download($filePath);
    }
    
    /**
     * Delete a backup file
     */
    public function destroy($filename)
    {
        $user = auth()->user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized access');
        }
        
        $backupDir = env('BACKUP_DIR', storage_path('app/backups'));
        $filePath = $backupDir . '/' . $filename;
        
        if (file_exists($filePath)) {
            unlink($filePath);
            Log::info('Backup deleted', ['file' => $filename, 'user' => $user->id]);
            
            return redirect()->route('backup.index')
                ->with('success', 'Backup deleted successfully.');
        }
        
        return redirect()->route('backup.index')
            ->with('error', 'Backup file not found.');
    }
    
    /**
     * Restore database from a backup
     */
    public function restore(Request $request, $filename)
    {
        $user = auth()->user();
        
        if ($user->role !== 'admin') {
            abort(403, 'Unauthorized access');
        }
        
        try {
            $backupDir = env('BACKUP_DIR', '/var/data/backups');
            $filePath = $backupDir . '/' . $filename;
            
            if (!file_exists($filePath)) {
                throw new \Exception('Backup file not found: ' . $filePath);
            }
            
            // Enter maintenance mode during restore
            try { \Artisan::call('down'); } catch (\Throwable $e) { /* ignore */ }
            
            $scriptPath = base_path('scripts/restore_local.sh');
            if (!file_exists($scriptPath)) {
                throw new \Exception('Restore script not found at: ' . $scriptPath);
            }
            chmod($scriptPath, 0755);
            
            // Environment variables
            $databaseUrl = env('INTERNAL_DATABASE_URL') ?: env('DATABASE_URL');
            
            // Execute restore script
            $command = sprintf(
                'export DATABASE_URL="%s" && %s "%s" 2>&1',
                $databaseUrl,
                $scriptPath,
                $filePath
            );
            
            exec($command, $output, $returnCode);
            
            // Exit maintenance mode
            try { \Artisan::call('up'); } catch (\Throwable $e) { /* ignore */ }
            
            if ($returnCode !== 0) {
                Log::error('Restore script failed', [
                    'output' => $output,
                    'return_code' => $returnCode
                ]);
                throw new \Exception('Restore failed: ' . implode("\n", $output));
            }
            
            Log::info('Database restored via script', ['file' => $filename, 'user' => $user->id]);
            
            return redirect()->route('backup.index')
                ->with('success', 'Database restored successfully!');
                
        } catch (\Exception $e) {
            try { \Artisan::call('up'); } catch (\Throwable $e2) { /* ignore */ }
            
            Log::error('Database restore failed', [
                'error' => $e->getMessage(),
                'user' => $user->id,
                'file' => $filename
            ]);
            
            return redirect()->route('backup.index')
                ->with('error', 'Failed to restore database: ' . $e->getMessage());
        }
    }
    
    /**
     * Get list of available backups
     */
    private function getBackupsList()
    {
        $backupsPath = env('BACKUP_DIR', storage_path('app/backups'));
        
        if (!file_exists($backupsPath)) {
            return [];
        }
        
        $files = scandir($backupsPath);
        $backups = [];
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $filePath = $backupsPath . '/' . $file;
            
            if (is_file($filePath)) {
                $backups[] = [
                    'filename' => $file,
                    'size' => filesize($filePath),
                    'size_formatted' => $this->formatBytes(filesize($filePath)),
                    'created_at' => Carbon::createFromTimestamp(filemtime($filePath))->toISOString(),
                    'created_at_formatted' => Carbon::createFromTimestamp(filemtime($filePath))->diffForHumans(),
                ];
            }
        }
        
        // Sort by creation date, newest first
        usort($backups, function ($a, $b) {
            return strcmp($b['created_at'], $a['created_at']);
        });
        
        return $backups;
    }
    
    /**
     * Format bytes to human-readable size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
