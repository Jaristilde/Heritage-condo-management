import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PreviewUnit {
  unit: string;
  owner: string;
  monthlyMaintenance: string;
  popularLoan: string;
  assessment2024: string;
  totalOwed: string;
  status: string;
}

interface ImportResponse {
  success: boolean;
  unitsUpdated: number;
  loansCreated: number;
  message?: string;
}

export default function ImportFinancialData() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewUnit[]>([]);
  const [importing, setImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setPreview([]);
    setErrors([]);

    // Validate file type
    if (!uploadedFile.name.endsWith('.csv')) {
      setErrors(["Please upload a CSV file (.csv)"]);
      return;
    }

    // Read and parse CSV
    const text = await uploadedFile.text();
    const lines = text.trim().split('\n');

    if (lines.length < 2) {
      setErrors(["CSV file is empty or invalid"]);
      return;
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['Unit', 'Owner', 'Monthly Maintenance', 'Popular Loan', '2024 Assessment', 'Total Owed', 'Status'];

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
      return;
    }

    // Parse data rows
    const previewData: PreviewUnit[] = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return {
        unit: values[headers.indexOf('Unit')],
        owner: values[headers.indexOf('Owner')],
        monthlyMaintenance: values[headers.indexOf('Monthly Maintenance')],
        popularLoan: values[headers.indexOf('Popular Loan')],
        assessment2024: values[headers.indexOf('2024 Assessment')],
        totalOwed: values[headers.indexOf('Total Owed')],
        status: values[headers.indexOf('Status')],
      };
    });

    setPreview(previewData);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/execute', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Import failed');
      }

      const result: ImportResponse = await response.json();

      toast({
        title: "Import Successful!",
        description: `Updated ${result.unitsUpdated} units and created ${result.loansCreated} loan records.`,
      });

      // Clear form
      setFile(null);
      setPreview([]);
      setErrors([]);

      // Invalidate units query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/units'] });

    } catch (error: any) {
      setErrors([error.message || 'Import failed. Please try again.']);
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Financial Data</h1>
        <p className="text-muted-foreground mt-2">
          Upload Juda & Eskew monthly financial report to update all unit data
        </p>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Template
          </CardTitle>
          <CardDescription>
            Use this CSV template to import your financial data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="/templates/juda-eskew-import-template.csv"
            download
            className="inline-flex"
          >
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
          </a>
          <p className="text-sm text-muted-foreground mt-4">
            The template includes all 24 units with the correct format. Copy data from the Juda & Eskew report and save as CSV.
          </p>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Financial Data
          </CardTitle>
          <CardDescription>
            Select your updated CSV file to import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Preview Data ({preview.length} units)
            </CardTitle>
            <CardDescription>
              Review the data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Popular Loan</TableHead>
                    <TableHead className="text-right">2024 Assessment</TableHead>
                    <TableHead className="text-right">Total Owed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((unit) => (
                    <TableRow key={unit.unit}>
                      <TableCell className="font-medium">{unit.unit}</TableCell>
                      <TableCell>{unit.owner}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(unit.popularLoan)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(unit.assessment2024)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(unit.totalOwed)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={unit.status.includes('Attorney') ? 'destructive' :
                                  unit.status.includes('90+') ? 'destructive' :
                                  unit.status.includes('Current') ? 'default' : 'secondary'}
                        >
                          {unit.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleImport}
                disabled={importing}
                size="lg"
                className="w-full sm:w-auto"
              >
                {importing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Import All {preview.length} Units
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setFile(null);
                  setPreview([]);
                  setErrors([]);
                }}
                variant="outline"
                disabled={importing}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
