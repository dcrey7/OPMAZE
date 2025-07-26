import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, Download, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { insertSampleData, clearAllData } from "@/utils/sampleData";
import * as XLSX from 'xlsx';

const DataUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, table: string) => {
    setUploading(true);
    
    try {
      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Upload to Supabase Storage
      const fileName = `${table}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert data into table based on table type
      let insertError;
      if (table === 'employees') {
        const { error } = await supabase.from('employees').insert(jsonData as any);
        insertError = error;
      } else if (table === 'products') {
        const { error } = await supabase.from('products').insert(jsonData as any);
        insertError = error;
      } else if (table === 'materials') {
        const { error } = await supabase.from('materials').insert(jsonData as any);
        insertError = error;
      } else if (table === 'resources') {
        const { error } = await supabase.from('resources').insert(jsonData as any);
        insertError = error;
      }

      if (insertError) throw insertError;

      toast({
        title: "Upload Successful",
        description: `${jsonData.length} records uploaded to ${table}`,
      });

      // Refresh data
      loadData();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const loadData = async () => {
    try {
      const [empRes, prodRes, matRes, resRes] = await Promise.all([
        supabase.from('employees').select('*').limit(10),
        supabase.from('products').select('*').limit(10),
        supabase.from('materials').select('*').limit(10),
        supabase.from('resources').select('*').limit(10),
      ]);

      setEmployees(empRes.data || []);
      setProducts(prodRes.data || []);
      setMaterials(matRes.data || []);
      setResources(resRes.data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleInsertSampleData = async () => {
    setUploading(true);
    try {
      const result = await insertSampleData();
      if (result.success) {
        toast({
          title: "✅ Database Reset Complete!",
          description: "All old data cleared. Fresh demo data inserted successfully.",
        });
        loadData();
        // Clear localStorage optimization stats
        localStorage.removeItem('optimizationStats');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!confirm("⚠️ This will DELETE ALL DATA from your database. Are you sure?")) {
      return;
    }
    
    setUploading(true);
    try {
      const result = await clearAllData();
      if (result.success) {
        toast({
          title: "🗑️ All Data Cleared",
          description: "Database has been completely cleared.",
        });
        loadData();
        // Clear localStorage optimization stats
        localStorage.removeItem('optimizationStats');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Clear Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Control Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <Button 
          onClick={handleInsertSampleData}
          disabled={uploading}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          <Database className="h-4 w-4 mr-2" />
          🔄 Reset & Insert Demo Data
        </Button>
        <Button 
          onClick={handleClearAllData}
          disabled={uploading}
          variant="destructive"
        >
          <Database className="h-4 w-4 mr-2" />
          🗑️ Clear All Data
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground mb-4">
        <p>⚠️ <strong>Recommended:</strong> Use "Reset & Insert Demo Data" to clear existing data and add fresh sample data for optimization testing.</p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: 'employees', label: 'Employees' },
          { name: 'products', label: 'Products' },
          { name: 'materials', label: 'Materials' },
          { name: 'resources', label: 'Resources' }
        ].map((item) => (
          <Card key={item.name} className="p-4">
            <div className="space-y-2">
              <Label htmlFor={`${item.name}-upload`}>{item.label}</Label>
              <Input
                id={`${item.name}-upload`}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, item.name);
                }}
                disabled={uploading}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="employees" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          <Button 
            onClick={loadData} 
            variant="outline" 
            size="sm"
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <TabsContent value="employees">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Employees ({employees.length})</h3>
                <Button
                  onClick={() => exportToExcel(employees, 'employees')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.employee_id}</TableCell>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.shift}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Products ({products.length})</h3>
                <Button
                  onClick={() => exportToExcel(products, 'products')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch Size</TableHead>
                    <TableHead>Demand</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell>{prod.product_code}</TableCell>
                      <TableCell>{prod.name}</TableCell>
                      <TableCell>{prod.batch_size}</TableCell>
                      <TableCell>{prod.demand_units}</TableCell>
                      <TableCell>{prod.priority}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Materials ({materials.length})</h3>
                <Button
                  onClick={() => exportToExcel(materials, 'materials')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Cost/kg</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell>{mat.material_id}</TableCell>
                      <TableCell>{mat.name}</TableCell>
                      <TableCell>{mat.quantity_kg}</TableCell>
                      <TableCell>${mat.cost_per_kg}</TableCell>
                      <TableCell>{mat.expiry_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Resources ({resources.length})</h3>
                <Button
                  onClick={() => exportToExcel(resources, 'resources')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>{res.resource_id}</TableCell>
                      <TableCell>{res.name}</TableCell>
                      <TableCell>{res.type}</TableCell>
                      <TableCell>{res.capacity}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          res.status === 'available' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {res.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataUploader;