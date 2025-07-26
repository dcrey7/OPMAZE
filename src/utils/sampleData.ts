import { supabase } from "@/integrations/supabase/client";

export const clearAllData = async () => {
  try {
    // Clear data in proper order to handle foreign key constraints
    await supabase.from('assignments').delete().neq('id', 0);
    await supabase.from('constraints').delete().neq('id', 0);
    await supabase.from('schedules').delete().neq('id', 0);
    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('employees').delete().neq('id', 0);
    await supabase.from('materials').delete().neq('id', 0);
    await supabase.from('resources').delete().neq('id', 0);

    console.log('All existing data cleared successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('Error clearing data:', error);
    return { success: false, error: error.message };
  }
};

export const insertSampleData = async () => {
  try {
    // First clear all existing data
    const clearResult = await clearAllData();
    if (!clearResult.success) {
      throw new Error(`Failed to clear existing data: ${clearResult.error}`);
    }

    // Insert sample employees with upsert to handle conflicts
    const { error: empError } = await supabase.from('employees').upsert([
      { employee_id: 'EMP001', name: 'John Smith', department: 'Production', shift: 'morning', available_monday: true, available_tuesday: true, available_wednesday: true },
      { employee_id: 'EMP002', name: 'Sarah Johnson', department: 'Assembly', shift: 'afternoon', available_monday: true, available_tuesday: false, available_wednesday: true },
      { employee_id: 'EMP003', name: 'Mike Chen', department: 'Quality Control', shift: 'morning', available_monday: false, available_tuesday: true, available_wednesday: true },
      { employee_id: 'EMP004', name: 'Lisa Rodriguez', department: 'Packaging', shift: 'evening', available_monday: true, available_tuesday: true, available_wednesday: false },
    ]);

    // Insert sample products
    const { error: prodError } = await supabase.from('products').upsert([
      { product_code: 'PROD001', name: 'Premium Widget A', batch_time: 4, batch_size: 50, demand_units: 200, priority: 1, materials_needed: 'Steel, Plastic, Electronics' },
      { product_code: 'PROD002', name: 'Standard Widget B', batch_time: 3, batch_size: 75, demand_units: 150, priority: 2, materials_needed: 'Aluminum, Rubber, Paint' },
      { product_code: 'PROD003', name: 'Deluxe Component C', batch_time: 6, batch_size: 25, demand_units: 100, priority: 1, materials_needed: 'Titanium, Glass, Circuits' },
      { product_code: 'PROD004', name: 'Basic Assembly D', batch_time: 2, batch_size: 100, demand_units: 300, priority: 3, materials_needed: 'Steel, Screws, Labels' },
    ]);

    // Insert sample materials
    const { error: matError } = await supabase.from('materials').upsert([
      { material_id: 'MAT001', name: 'Steel Sheets', quantity_kg: 500.0, cost_per_kg: 3.50, expiry_date: '2025-12-31' },
      { material_id: 'MAT002', name: 'High-grade Plastic', quantity_kg: 200.0, cost_per_kg: 2.25, expiry_date: '2025-06-30' },
      { material_id: 'MAT003', name: 'Electronic Components', quantity_kg: 50.0, cost_per_kg: 15.00, expiry_date: '2025-09-15' },
      { material_id: 'MAT004', name: 'Aluminum Bars', quantity_kg: 300.0, cost_per_kg: 4.75, expiry_date: '2025-11-30' },
    ]);

    // Insert sample resources
    const { error: resError } = await supabase.from('resources').upsert([
      { resource_id: 'RES001', name: 'CNC Machine Alpha', type: 'Manufacturing', capacity: 2, status: 'available', maintenance_schedule: { next_maintenance: '2025-02-15' } },
      { resource_id: 'RES002', name: 'Assembly Line Beta', type: 'Assembly', capacity: 4, status: 'available', maintenance_schedule: { next_maintenance: '2025-03-01' } },
      { resource_id: 'RES003', name: 'Quality Scanner Gamma', type: 'Quality Control', capacity: 1, status: 'available', maintenance_schedule: { next_maintenance: '2025-02-28' } },
      { resource_id: 'RES004', name: 'Packaging Station Delta', type: 'Packaging', capacity: 3, status: 'maintenance', maintenance_schedule: { next_maintenance: '2025-01-30' } },
    ]);

    if (empError) throw empError;
    if (prodError) throw prodError;
    if (matError) throw matError;
    if (resError) throw resError;

    console.log('Sample data inserted successfully!');
    return { success: true };
  } catch (error: any) {
    console.error('Error inserting sample data:', error);
    return { success: false, error: error.message };
  }
};