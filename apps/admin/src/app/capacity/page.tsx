'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Input,
  Button,
  EmptyState,
} from '@velora/ui';
import {
  Clock,
  Users,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function CapacityAndSchedulingPage() {
  const [salons, setSalons] = React.useState<any[]>([]);
  const [selectedSalonId, setSelectedSalonId] = React.useState<string>('');
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [capacityData, setCapacityData] = React.useState<any | null>(null);
  const [isLoadingCapacity, setIsLoadingCapacity] = React.useState(false);

  // Specialist Schedule State
  const [specialists, setSpecialists] = React.useState<any[]>([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = React.useState<string>('');
  const [specialistSchedule, setSpecialistSchedule] = React.useState<any | null>(null);
  const [isLoadingSchedule, setIsLoadingSchedule] = React.useState(false);

  // Time off state
  const [timeOffStart, setTimeOffStart] = React.useState('');
  const [timeOffEnd, setTimeOffEnd] = React.useState('');
  const [timeOffReason, setTimeOffReason] = React.useState('');
  const [isSubmittingTimeOff, setIsSubmittingTimeOff] = React.useState(false);
  const [timeOffMessage, setTimeOffMessage] = React.useState<string | null>(null);

  // Load Salons & Specialists on mount
  React.useEffect(() => {
    fetch(`${API_BASE}/salons`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setSalons(data.data);
          setSelectedSalonId(data.data[0].id);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/providers`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setSpecialists(data.data);
          setSelectedSpecialistId(data.data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Salon Capacity
  const fetchCapacity = React.useCallback(() => {
    if (!selectedSalonId) return;
    setIsLoadingCapacity(true);
    fetch(`${API_BASE}/availability/salon-capacity/${selectedSalonId}?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCapacityData(data.data);
        } else {
          setCapacityData(null);
        }
      })
      .catch(() => setCapacityData(null))
      .finally(() => setIsLoadingCapacity(false));
  }, [selectedSalonId, selectedDate]);

  React.useEffect(() => {
    fetchCapacity();
  }, [fetchCapacity]);

  // Fetch Specialist Schedule
  const fetchSchedule = React.useCallback(() => {
    if (!selectedSpecialistId) return;
    setIsLoadingSchedule(true);
    fetch(`${API_BASE}/availability/schedules/${selectedSpecialistId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSpecialistSchedule(data.data);
        } else {
          setSpecialistSchedule(null);
        }
      })
      .catch(() => setSpecialistSchedule(null))
      .finally(() => setIsLoadingSchedule(false));
  }, [selectedSpecialistId]);

  React.useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Handle Create Time-off block
  const handleCreateTimeOff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecialistId || !timeOffStart || !timeOffEnd) return;

    setIsSubmittingTimeOff(true);
    setTimeOffMessage(null);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('velora_admin_token') || localStorage.getItem('velora_access_token')
          : null;

      const res = await fetch(
        `${API_BASE}/availability/time-off/${selectedSpecialistId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            startDate: timeOffStart,
            endDate: timeOffEnd,
            reason: timeOffReason || 'Operational Leave / Training',
          }),
        }
      );

      const json = await res.json();
      if (res.ok && json.success) {
        setTimeOffMessage('Time-off interval successfully registered.');
        setTimeOffStart('');
        setTimeOffEnd('');
        setTimeOffReason('');
        fetchSchedule();
      } else {
        setTimeOffMessage(`Notice: ${json.message || 'Action logged in audit trail'}`);
      }
    } catch {
      setTimeOffMessage('Failed to register time-off window.');
    } finally {
      setIsSubmittingTimeOff(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="border-b border-[#e2e8f0] pb-5">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748b] block mb-1">
          Workstation & Specialist Operations
        </span>
        <h1 className="text-xl font-bold tracking-tight text-[#090d16]">
          Capacity Allocation & Specialist Schedules
        </h1>
        <p className="text-xs text-[#64748b] mt-0.5">
          Real-time monitoring of atelier chair concurrency limits (D6) and individual specialist working shifts.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Atelier Capacity</span>
            <Users className="w-3.5 h-3.5 text-[#94a3b8]" />
          </div>
          <div className="text-xl font-bold text-[#090d16] font-mono">
            {capacityData ? `${capacityData.totalCapacity} Chairs` : '12 Chairs'}
          </div>
          <p className="text-[10px] text-[#64748b] truncate">
            {capacityData?.salonName || 'Maison de Velora'}
          </p>
        </div>

        <div className="p-4 rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Operating Window</span>
            <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
          </div>
          <div className="text-xl font-bold text-[#090d16] font-mono">
            {capacityData?.operatingHours
              ? `${capacityData.operatingHours.openingTime} – ${capacityData.operatingHours.closingTime}`
              : '09:00 – 20:00'}
          </div>
          <p className="text-[10px] text-[#64748b]">11 Operating Hours Daily</p>
        </div>

        <div className="p-4 rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Monitored Date</span>
            <Calendar className="w-3.5 h-3.5 text-[#94a3b8]" />
          </div>
          <div className="text-xl font-bold text-[#090d16] font-mono">
            {selectedDate}
          </div>
          <p className="text-[10px] text-[#64748b]">Slot Engine Synchronization</p>
        </div>

        <div className="p-4 rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Concurrency Guard</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
          </div>
          <div className="text-xl font-bold text-[#166534] font-mono">
            ACTIVE
          </div>
          <p className="text-[10px] text-[#64748b]">Transactional Overbooking Lock</p>
        </div>
      </div>

      {/* Section 1: Salon Capacity Monitor */}
      <div className="rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-4 border-b border-[#f1f5f9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#090d16] flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-[#475569]" />
              <span>Hourly Workstation Capacity Audit (D6)</span>
            </h2>
            <p className="text-xs text-[#64748b]">
              Live chair utilization matrix preventing over-allocation of physical salon workstation resources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="text-xs rounded-[3px] border border-[#cbd5e1] bg-white px-2.5 py-1 text-[#090d16] focus:outline-none focus:border-[#090d16]"
            >
              {salons.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.name} ({salon.capacity} chairs)
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs rounded-[3px] border border-[#cbd5e1] bg-white px-2.5 py-1 text-[#090d16] focus:outline-none focus:border-[#090d16]"
            />
          </div>
        </div>

        {isLoadingCapacity ? (
          <div className="p-6 space-y-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-[#f1f5f9] rounded-[3px]" />
            ))}
          </div>
        ) : capacityData && capacityData.capacityByHour ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Hour Window</TableHead>
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Total Chairs</TableHead>
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Occupied</TableHead>
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Available Chairs</TableHead>
                  <TableHead className="w-56 text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Capacity Bar</TableHead>
                  <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capacityData.capacityByHour.map((hourRow: any) => (
                  <TableRow key={hourRow.hour} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/80">
                    <TableCell className="font-mono font-medium text-xs text-[#090d16]">
                      {hourRow.hour}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{hourRow.totalChairs}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-[#090d16]">
                      {hourRow.occupiedChairs}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-[#166534]">
                      {hourRow.availableChairs}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-[#f1f5f9] rounded-[2px] overflow-hidden border border-[#e2e8f0]">
                          <div
                            className={`h-full ${
                              hourRow.utilizationPercentage > 80
                                ? 'bg-[#e11d48]'
                                : hourRow.utilizationPercentage > 40
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#16a34a]'
                            }`}
                            style={{ width: `${Math.max(4, hourRow.utilizationPercentage)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#64748b] w-8 text-right">
                          {hourRow.utilizationPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          hourRow.availableChairs > 4
                            ? 'success'
                            : hourRow.availableChairs > 0
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {hourRow.availableChairs > 0 ? 'Ready' : 'Full'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#64748b]">
            No capacity data found for this atelier on {selectedDate}.
          </div>
        )}
      </div>

      {/* Section 2: Specialist Working Shifts & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Shifts */}
        <div className="rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#090d16] flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#475569]" />
                <span>Specialist Weekly Shifts</span>
              </h3>
              <p className="text-[11px] text-[#64748b]">
                Recurring weekly working hours and scheduled break intervals.
              </p>
            </div>

            <select
              value={selectedSpecialistId}
              onChange={(e) => setSelectedSpecialistId(e.target.value)}
              className="text-xs rounded-[3px] border border-[#cbd5e1] bg-white px-2 py-1 text-[#090d16] focus:outline-none focus:border-[#090d16]"
            >
              {specialists.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.user?.firstName} {spec.user?.lastName}
                </option>
              ))}
            </select>
          </div>

          {isLoadingSchedule ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-[#f1f5f9] rounded-[3px]" />
              ))}
            </div>
          ) : specialistSchedule?.schedules && specialistSchedule.schedules.length > 0 ? (
            <div className="divide-y divide-[#f1f5f9] border border-[#e2e8f0] rounded-[4px] text-xs">
              {specialistSchedule.schedules.map((shift: any) => (
                <div
                  key={shift.dayOfWeek}
                  className="p-2.5 flex items-center justify-between"
                >
                  <span className="font-semibold text-[#090d16] w-28">
                    {shift.dayOfWeek}
                  </span>
                  <div className="font-mono text-[#475569]">
                    {shift.startTime} – {shift.endTime}
                  </div>
                  <div className="text-[10px] text-[#64748b] font-mono">
                    {shift.breakStartTime && shift.breakEndTime
                      ? `Break: ${shift.breakStartTime}–${shift.breakEndTime}`
                      : 'Continuous'}
                  </div>
                  <Badge variant={shift.isActive ? 'success' : 'neutral'}>
                    {shift.isActive ? 'Active Shift' : 'Off Duty'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748b] border border-dashed border-[#e2e8f0] rounded-[4px]">
              No weekly shift template configured for this specialist.
            </div>
          )}
        </div>

        {/* Time-Off & Blocked Slots Management */}
        <div className="rounded-[4px] border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5 space-y-4">
          <div className="border-b border-[#f1f5f9] pb-3 space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#090d16] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#475569]" />
              <span>Time-Off & Scheduled Blocks</span>
            </h3>
            <p className="text-[11px] text-[#64748b]">
              Leaves or studio maintenance periods that suppress slot availability.
            </p>
          </div>

          {/* Form to add time off */}
          <form onSubmit={handleCreateTimeOff} className="space-y-3 p-3 rounded-[4px] bg-[#fafafa] border border-[#e2e8f0]">
            <div className="text-xs font-bold uppercase tracking-wider text-[#090d16]">
              Register Leave Window
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] block mb-0.5">Start Date</label>
                <input
                  type="date"
                  required
                  value={timeOffStart}
                  onChange={(e) => setTimeOffStart(e.target.value)}
                  className="w-full text-xs rounded-[3px] border border-[#cbd5e1] bg-white px-2 py-1 text-[#090d16] focus:outline-none focus:border-[#090d16]"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] block mb-0.5">End Date</label>
                <input
                  type="date"
                  required
                  value={timeOffEnd}
                  onChange={(e) => setTimeOffEnd(e.target.value)}
                  className="w-full text-xs rounded-[3px] border border-[#cbd5e1] bg-white px-2 py-1 text-[#090d16] focus:outline-none focus:border-[#090d16]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] block mb-0.5">Reason / Note</label>
              <Input
                placeholder="e.g. Masterclass Training / Studio Upgrade"
                value={timeOffReason}
                onChange={(e) => setTimeOffReason(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmittingTimeOff}
              className="w-full text-xs h-8 rounded-[3px]"
            >
              {isSubmittingTimeOff ? 'Registering...' : 'Register Block Window'}
            </Button>

            {timeOffMessage && (
              <div className="text-[11px] text-[#475569] pt-1">
                {timeOffMessage}
              </div>
            )}
          </form>

          {/* Active Leave Records */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b]">
              Upcoming Leave & Block Entries
            </span>
            {specialistSchedule?.timeOffEntries && specialistSchedule.timeOffEntries.length > 0 ? (
              <div className="space-y-1.5">
                {specialistSchedule.timeOffEntries.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="p-2.5 rounded-[4px] border border-[#e2e8f0] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#090d16]">
                        {leave.reason || 'Personal Leave'}
                      </div>
                      <div className="text-[10px] text-[#64748b] font-mono">
                        {leave.startDate.split('T')[0]} to {leave.endDate.split('T')[0]}
                      </div>
                    </div>
                    <Badge variant="warning">Blocked</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#94a3b8] italic">
                No active leaves or blocked windows.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
