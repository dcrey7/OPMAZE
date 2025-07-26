import { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Plus, Calendar as CalendarIcon, Users, Factory } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface Assignment {
  id: number;
  employee_id: string;
  product_code: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  title?: string;
  resource?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Assignment;
}

const CalendarView = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const [employees, setEmployees] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    employee_id: '',
    product_code: '',
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [showNewDialog, setShowNewDialog] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [assignmentsRes, employeesRes, productsRes] = await Promise.all([
        supabase.from('assignments').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('products').select('*')
      ]);

      if (assignmentsRes.error) throw assignmentsRes.error;
      if (employeesRes.error) throw employeesRes.error;
      if (productsRes.error) throw productsRes.error;

      setEmployees(employeesRes.data || []);
      setProducts(productsRes.data || []);

      // Transform assignments to calendar events with detailed descriptions
      const calendarEvents: CalendarEvent[] = (assignmentsRes.data || []).map((assignment: Assignment) => {
        const employee = employeesRes.data?.find(emp => emp.employee_id === assignment.employee_id);
        const product = productsRes.data?.find(prod => prod.product_code === assignment.product_code);
        
        const startTime = moment(assignment.start_time);
        const endTime = moment(assignment.end_time);
        const duration = moment.duration(endTime.diff(startTime));
        
        // Create detailed title with time and description
        const title = `🏭 ${product?.name || assignment.product_code}
👤 ${employee?.name || assignment.employee_id}
⏱️ ${duration.asHours()}h (${startTime.format('HH:mm')}-${endTime.format('HH:mm')})
📊 Priority: ${product?.priority || 'N/A'}`;
        
        return {
          id: assignment.id,
          title: title,
          start: new Date(assignment.start_time),
          end: new Date(assignment.end_time),
          resource: {
            ...assignment,
            employee_name: employee?.name,
            product_name: product?.name,
            product_priority: product?.priority,
            department: employee?.department
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error: any) {
      toast({
        title: "Error Loading Schedule",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Listen for schedule updates from AI optimization
    const handleScheduleUpdate = () => {
      loadData();
    };

    window.addEventListener('scheduleUpdated', handleScheduleUpdate);
    
    return () => {
      window.removeEventListener('scheduleUpdated', handleScheduleUpdate);
    };
  }, [loadData]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewAssignment({
      employee_id: '',
      product_code: '',
      start_time: moment(start).format('YYYY-MM-DDTHH:mm'),
      end_time: moment(end).format('YYYY-MM-DDTHH:mm'),
      notes: ''
    });
    setShowNewDialog(true);
  };

  const createAssignment = async () => {
    try {
      const { error } = await supabase
        .from('assignments')
        .insert({
          employee_id: newAssignment.employee_id,
          product_code: newAssignment.product_code,
          start_time: newAssignment.start_time,
          end_time: newAssignment.end_time,
          notes: newAssignment.notes,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Assignment Created",
        description: "New production assignment has been scheduled.",
      });

      setShowNewDialog(false);
      setNewAssignment({
        employee_id: '',
        product_code: '',
        start_time: '',
        end_time: '',
        notes: ''
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error Creating Assignment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateAssignmentStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Assignment marked as ${status}`,
      });

      loadData();
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Error Updating Status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAssignment = async (id: number) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Assignment Deleted",
        description: "Production assignment has been removed.",
      });

      loadData();
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Error Deleting Assignment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportSchedule = () => {
    const exportData = events.map(event => ({
      Employee: employees.find(emp => emp.employee_id === event.resource.employee_id)?.name || event.resource.employee_id,
      Product: products.find(prod => prod.product_code === event.resource.product_code)?.name || event.resource.product_code,
      'Start Time': moment(event.start).format('YYYY-MM-DD HH:mm'),
      'End Time': moment(event.end).format('YYYY-MM-DD HH:mm'),
      Status: event.resource.status,
      Notes: event.resource.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    XLSX.writeFile(wb, `production_schedule_${moment().format('YYYY-MM-DD')}.xlsx`);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3B82F6';
    let borderColor = '#1E40AF';
    
    switch (event.resource.status) {
      case 'completed':
        backgroundColor = '#10B981';
        borderColor = '#047857';
        break;
      case 'in_progress':
        backgroundColor = '#F59E0B';
        borderColor = '#D97706';
        break;
      case 'delayed':
        backgroundColor = '#EF4444';
        borderColor = '#DC2626';
        break;
      default:
        backgroundColor = '#3B82F6';
        borderColor = '#1E40AF';
    }

    // Different colors based on priority
    if (event.resource.product_priority === 1) {
      backgroundColor = '#DC2626'; // High priority - red
      borderColor = '#B91C1C';
    } else if (event.resource.product_priority === 2) {
      backgroundColor = '#F59E0B'; // Medium priority - orange
      borderColor = '#D97706';
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        display: 'block',
        fontSize: '11px',
        lineHeight: '1.2',
        padding: '2px 4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    };
  };

  // Custom event component for better display
  const CustomEvent = ({ event }: { event: any }) => {
    const lines = event.title.split('\n');
    return (
      <div className="text-xs leading-tight">
        {lines.map((line: string, index: number) => (
          <div key={index} className="truncate">
            {line}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Production Schedule</h3>
          <Badge variant="secondary">{events.length} assignments</Badge>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Completed</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Schedule a new production assignment for an employee and product.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    Employee
                  </Label>
                  <Select value={newAssignment.employee_id} onValueChange={(value) => 
                    setNewAssignment(prev => ({ ...prev, employee_id: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.employee_id} value={emp.employee_id}>
                          {emp.name} ({emp.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="product" className="text-right">
                    Product
                  </Label>
                  <Select value={newAssignment.product_code} onValueChange={(value) => 
                    setNewAssignment(prev => ({ ...prev, product_code: value }))
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(prod => (
                        <SelectItem key={prod.product_code} value={prod.product_code}>
                          {prod.name} (Priority: {prod.priority})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start" className="text-right">
                    Start
                  </Label>
                  <Input
                    id="start"
                    type="datetime-local"
                    value={newAssignment.start_time}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, start_time: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end" className="text-right">
                    End
                  </Label>
                  <Input
                    id="end"
                    type="datetime-local"
                    value={newAssignment.end_time}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, end_time: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={newAssignment.notes}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
                    className="col-span-3"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createAssignment}
                  disabled={!newAssignment.employee_id || !newAssignment.product_code}
                >
                  Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={exportSchedule} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <CardContent className="p-0">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              step={60}
              showMultiDayTimes
              popup
              popupOffset={30}
              components={{
                toolbar: (props) => (
                  <div className="flex justify-between items-center mb-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => props.onNavigate('PREV')}>
                        ←
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => props.onNavigate('TODAY')}>
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => props.onNavigate('NEXT')}>
                        →
                      </Button>
                    </div>
                    <h3 className="text-lg font-semibold">{props.label}</h3>
                    <div className="flex gap-1">
                      <Button 
                        variant={view === 'month' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => props.onView('month')}
                      >
                        Month
                      </Button>
                      <Button 
                        variant={view === 'week' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => props.onView('week')}
                      >
                        Week
                      </Button>
                      <Button 
                        variant={view === 'day' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => props.onView('day')}
                      >
                        Day
                      </Button>
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assignment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">👤 Employee</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.employee_name || selectedEvent.employee_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dept: {selectedEvent.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">🏭 Product</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.product_name || selectedEvent.product_code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Priority: {selectedEvent.product_priority || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">⏰ Start Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {moment(selectedEvent.start_time).format('MMM DD, HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">🏁 End Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {moment(selectedEvent.end_time).format('MMM DD, HH:mm')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">⏱️ Duration</Label>
                  <p className="text-sm text-muted-foreground">
                    {moment.duration(moment(selectedEvent.end_time).diff(moment(selectedEvent.start_time))).asHours().toFixed(1)}h
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={
                    selectedEvent.status === 'completed' ? 'default' :
                    selectedEvent.status === 'in_progress' ? 'secondary' :
                    selectedEvent.status === 'delayed' ? 'destructive' : 'outline'
                  }>
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>
              {selectedEvent.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="destructive"
                onClick={() => deleteAssignment(selectedEvent.id)}
                size="sm"
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => updateAssignmentStatus(selectedEvent.id, 'in_progress')}
                  size="sm"
                >
                  Start
                </Button>
                <Button
                  onClick={() => updateAssignmentStatus(selectedEvent.id, 'completed')}
                  size="sm"
                >
                  Complete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarView;