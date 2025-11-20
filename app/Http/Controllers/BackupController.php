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
            $backupName = 'backup_' . Carbon::now()->format('Y-m-d_His') . '.sql';
            $backupPath = storage_path('app/backups/' . $backupName);
            
            // Create backups directory if it doesn't exist
            if (!file_exists(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }
            
            // Get database configuration
            $dbHost = config('database.connections.' . config('database.default') . '.host');
            $dbName = config('database.connections.' . config('database.default') . '.database');
            $dbUser = config('database.connections.' . config('database.default') . '.username');
            $dbPass = config('database.connections.' . config('database.default') . '.password');
            $dbPort = config('database.connections.' . config('database.default') . '.port');
            
            $connection = config('database.default');
            
            // For SQLite
            if ($connection === 'sqlite') {
                $dbPath = database_path('database.sqlite');
                if (file_exists($dbPath)) {
                    copy($dbPath, $backupPath);
                    Log::info('SQLite backup created', ['file' => $backupName, 'user' => $user->id]);
                } else {
                    throw new \Exception('SQLite database file not found');
                }
            }
            // For PostgreSQL
            elseif ($connection === 'pgsql') {
                $command = sprintf(
                    'PGPASSWORD="%s" pg_dump -h %s -p %s -U %s %s > %s 2>&1',
                    $dbPass,
                    $dbHost,
                    $dbPort,
                    $dbUser,
                    $dbName,
                    $backupPath
                );
                
                exec($command, $output, $returnCode);
                
                if ($returnCode !== 0) {
                    Log::error('PostgreSQL backup failed', [
                        'output' => $output,
                        'return_code' => $returnCode
                    ]);
                    throw new \Exception('PostgreSQL backup failed: ' . implode("\n", $output));
                }
                
                Log::info('PostgreSQL backup created', ['file' => $backupName, 'user' => $user->id]);
            }
            // For MySQL
            elseif ($connection === 'mysql') {
                $command = sprintf(
                    'mysqldump -h %s -P %s -u %s -p"%s" %s > %s 2>&1',
                    $dbHost,
                    $dbPort,
                    $dbUser,
                    $dbPass,
                    $dbName,
                    $backupPath
                );
                
                exec($command, $output, $returnCode);
                
                if ($returnCode !== 0) {
                    Log::error('MySQL backup failed', [
                        'output' => $output,
                        'return_code' => $returnCode
                    ]);
                    throw new \Exception('MySQL backup failed: ' . implode("\n", $output));
                }
                
                Log::info('MySQL backup created', ['file' => $backupName, 'user' => $user->id]);
            } else {
                throw new \Exception('Unsupported database type: ' . $connection);
            }
            
            return redirect()->route('backup.index')
                ->with('success', 'Database backup created successfully!');
                
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
        
        $filePath = storage_path('app/backups/' . $filename);
        
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
        
        $filePath = storage_path('app/backups/' . $filename);
        
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
            $filePath = storage_path('app/backups/' . $filename);
            
            if (!file_exists($filePath)) {
                throw new \Exception('Backup file not found');
            }
            
            $connection = config('database.default');
            
            // Get database configuration
            $dbHost = config('database.connections.' . $connection . '.host');
            $dbName = config('database.connections.' . $connection . '.database');
            $dbUser = config('database.connections.' . $connection . '.username');
            $dbPass = config('database.connections.' . $connection . '.password');
            $dbPort = config('database.connections.' . $connection . '.port');
            
            // For SQLite
            if ($connection === 'sqlite') {
                $dbPath = database_path('database.sqlite');
                
                // Backup current database before restore
                $currentBackup = database_path('database_before_restore_' . Carbon::now()->format('Y-m-d_His') . '.sqlite');
                copy($dbPath, $currentBackup);
                
                // Restore from backup
                copy($filePath, $dbPath);
                
                Log::info('SQLite database restored', ['file' => $filename, 'user' => $user->id]);
            }
            // For PostgreSQL
            elseif ($connection === 'pgsql') {
                $command = sprintf(
                    'PGPASSWORD="%s" psql -h %s -p %s -U %s %s < %s 2>&1',
                    $dbPass,
                    $dbHost,
                    $dbPort,
                    $dbUser,
                    $dbName,
                    $filePath
                );
                
                exec($command, $output, $returnCode);
                
                if ($returnCode !== 0) {
                    Log::error('PostgreSQL restore failed', [
                        'output' => $output,
                        'return_code' => $returnCode
                    ]);
                    throw new \Exception('PostgreSQL restore failed: ' . implode("\n", $output));
                }
                
                Log::info('PostgreSQL database restored', ['file' => $filename, 'user' => $user->id]);
            }
            // For MySQL
            elseif ($connection === 'mysql') {
                $command = sprintf(
                    'mysql -h %s -P %s -u %s -p"%s" %s < %s 2>&1',
                    $dbHost,
                    $dbPort,
                    $dbUser,
                    $dbPass,
                    $dbName,
                    $filePath
                );
                
                exec($command, $output, $returnCode);
                
                if ($returnCode !== 0) {
                    Log::error('MySQL restore failed', [
                        'output' => $output,
                        'return_code' => $returnCode
                    ]);
                    throw new \Exception('MySQL restore failed: ' . implode("\n", $output));
                }
                
                Log::info('MySQL database restored', ['file' => $filename, 'user' => $user->id]);
            } else {
                throw new \Exception('Unsupported database type: ' . $connection);
            }
            
            return redirect()->route('backup.index')
                ->with('success', 'Database restored successfully! Please refresh the page.');
                
        } catch (\Exception $e) {
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
        $backupsPath = storage_path('app/backups');
        
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
