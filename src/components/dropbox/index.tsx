import { useState, useRef } from 'react';
import { Upload, FileText, X, Download, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const DropBox = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && isValidFile(droppedFile)) {
            setFile(droppedFile);
            setUploadStatus('idle');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && isValidFile(selectedFile)) {
            setFile(selectedFile);
            setUploadStatus('idle');
        }
    };

    const isValidFile = (file: File) => {
        const validTypes = ['.csv', '.xls', '.xlsx', '.xlsm'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            alert('File size exceeds 5MB limit');
            return false;
        }

        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return validTypes.includes(extension);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploadStatus('uploading');
        // Simulate upload
        setTimeout(() => {
            setUploadStatus('success');
            // In real app, handle the actual upload here
        }, 1500);
    };

    return (
        <Dialog>
            <form onSubmit={handleUpload}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Bulk Upload Combo List</DialogTitle>
                        <DialogDescription>
                            Upload a CSV or Excel file containing your combo data. Maximum file size: 5MB
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Left Column: File Upload */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file-upload" className="text-sm font-medium mb-2 block">
                                    Select File
                                </Label>

                                {/* Enhanced Dropzone */}
                                <div
                                    className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${isDragging
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                                        }
                bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm
                ${file ? 'border-green-200 dark:border-green-800' : ''}
              `}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDrop={handleDrop}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                >
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className={`
                  rounded-full p-3 transition-colors
                  ${file
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-gray-100 dark:bg-gray-800'
                                            }
                `}>
                                            {file ? (
                                                <CheckCircle className="h-6 w-6" />
                                            ) : (
                                                <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">
                                                {file ? 'File Selected' : 'Drag & drop your file here'}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {file ? 'Click to change file' : 'or click to browse'}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Supports: CSV, XLS, XLSX (Max 5MB)
                                            </p>
                                            {file && (
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    ✓ File format validated
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        id="file-upload"
                                        className="hidden"
                                        accept=".csv,.xls,.xlsx,.xlsm"
                                        onChange={handleFileSelect}
                                    />
                                </div>
                            </div>

                            {/* File Details */}
                            {file && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label>File Details</Label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        <span>•</span>
                                                        <span>Modified: {new Date(file.lastModified).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 flex-shrink-0"
                                                onClick={handleRemoveFile}
                                            >
                                                <X className="h-4 w-4" />
                                                <span className="sr-only">Remove file</span>
                                            </Button>
                                        </div>

                                        {/* Upload Progress/Status */}
                                        {uploadStatus !== 'idle' && (
                                            <div className={`
                    p-3 rounded-lg border text-sm
                    ${uploadStatus === 'uploading' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
                    ${uploadStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
                    ${uploadStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
                  `}>
                                                <div className="flex items-center gap-2">
                                                    {uploadStatus === 'uploading' && (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                            <span>Uploading file...</span>
                                                        </>
                                                    )}
                                                    {uploadStatus === 'success' && (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                            <span>File uploaded successfully!</span>
                                                        </>
                                                    )}
                                                    {uploadStatus === 'error' && (
                                                        <>
                                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                                            <span>Upload failed. Please try again.</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Info & Template */}
                        <div className="space-y-6">


                            {/* Template Section */}
                            <div className="rounded-lg border p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium">Need a template?</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Download our CSV template to ensure proper formatting for bulk upload.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download CSV Template
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download Excel Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirements */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">File Requirements</h3>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>Max 5MB size</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>CSV or Excel</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>UTF-8 encoding</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        <span>Max 10k rows</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        {/* <div className="space-y-4 col-span-2">
                                <h3 className="font-semibold text-sm">Instructions</h3>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-3">
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium">1</span>
                                        </div>
                                        <span>Prepare your combo data in CSV or Excel format</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium">2</span>
                                        </div>
                                        <span>Use the template below for correct column structure</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium">3</span>
                                        </div>
                                        <span>Upload your file using the dropzone</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium">4</span>
                                        </div>
                                        <span>Review and submit for processing</span>
                                    </li>
                                </ul>
                            </div> */}
                    </div>

                    <DialogFooter className="border-t pt-4 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={!file || uploadStatus === 'uploading'}
                            className="min-w-[120px]"
                        >
                            {uploadStatus === 'uploading' ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                </>
                            ) : uploadStatus === 'success' ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Uploaded
                                </>
                            ) : (
                                'Upload & Process'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default DropBox