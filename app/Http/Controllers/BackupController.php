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
            
            // Create backups directory if it doesn't exist
            if (!file_exists($backupDir)) {
                mkdir($backupDir, 0755, true);
            }
            
            // Use the backup script for Render/PostgreSQL
            $scriptPath = base_path('scripts/backup.sh');
            
            if (file_exists($scriptPath)) {
                // Make script executable
                chmod($scriptPath, 0755);
                
                // Set environment variables
                $databaseUrl = env('INTERNAL_DATABASE_URL') ?: env('DATABASE_URL');
                
                // Execute backup script
                $command = sprintf(
                    'export DATABASE_URL="%s" && export BACKUP_DIR="%s" && %s 2>&1',
                    $databaseUrl,
                    $backupDir,
                    $scriptPath
                );
                
                exec($command, $output, $returnCode);
                
                if ($returnCode !== 0) {
                    Log::error('Backup script failed', [
                        'output' => $output,
                        'return_code' => $returnCode
                    ]);
                    throw new \Exception('Backup failed: ' . implode("\n", $output));
                }
                
                Log::info('Backup created via script', ['output' => $output, 'user' => $user->id]);
                
                return redirect()->route('backup.index')
                    ->with('success', 'Database backup created successfully!');
            } else {
                throw new \Exception('Backup script not found at: ' . $scriptPath);
            }
                
        } catch (\Exception $e) {
            Log::error('Backup creation failed', [
                'error' => $e->getMessage(),
                'user' => $user->id
            ]);
            
            return redirect()->route('backup.index')
                ->with('error', 'Failed to create backup: ' . $e->getMessage());
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
