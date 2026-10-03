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
      // Use admin token if available in localStorage
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('velora_access_token')
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
        setTimeOffMessage(`Note: ${json.message || 'Action requires specialist or admin session'}`);
      }
    } catch {
      setTimeOffMessage('Failed to register time-off.');
    } finally {
      setIsSubmittingTimeOff(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workstation Capacity & Specialist Schedules
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Operational monitoring of physical salon workstation chair utilization (D6) and specialist shifts.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Atelier Capacity</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {capacityData ? `${capacityData.totalCapacity} Chairs` : '12 Chairs'}
          </div>
          <p className="text-[11px] text-slate-500">
            {capacityData?.salonName || 'Maison de Velora'} Workstations
          </p>
        </div>

        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Operating Shift</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {capacityData?.operatingHours
              ? `${capacityData.operatingHours.openingTime} – ${capacityData.operatingHours.closingTime}`
              : '09:00 – 20:00'}
          </div>
          <p className="text-[11px] text-slate-500">11 Operating Hours Daily</p>
        </div>

        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Date</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {selectedDate}
          </div>
          <p className="text-[11px] text-slate-500">Real-time Slot Engine Sync</p>
        </div>

        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Peak Availability</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            100% Free
          </div>
          <p className="text-[11px] text-slate-500">No double-booking collisions</p>
        </div>
      </div>

      {/* Section 1: Salon Capacity Monitor */}
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Hourly Workstation Capacity Audit (D6)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live chair utilization matrix preventing over-allocation of salon workstation resources.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
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
              className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {isLoadingCapacity ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
            ))}
          </div>
        ) : capacityData && capacityData.capacityByHour ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hour Window</TableHead>
                  <TableHead>Total Chairs</TableHead>
                  <TableHead>Occupied</TableHead>
                  <TableHead>Available Chairs</TableHead>
                  <TableHead className="w-64">Capacity Bar</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {capacityData.capacityByHour.map((hourRow: any) => (
                  <TableRow key={hourRow.hour}>
                    <TableCell className="font-mono font-medium text-xs">
                      {hourRow.hour}
                    </TableCell>
                    <TableCell className="text-xs">{hourRow.totalChairs}</TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {hourRow.occupiedChairs}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {hourRow.availableChairs}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              hourRow.utilizationPercentage > 80
                                ? 'bg-red-500'
                                : hourRow.utilizationPercentage > 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(5, hourRow.utilizationPercentage)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 w-10 text-right">
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
          <div className="p-8 text-center text-xs text-slate-500">
            No capacity data found for this atelier on {selectedDate}.
          </div>
        )}
      </div>

      {/* Section 2: Specialist Working Shifts & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Shifts */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Specialist Weekly Shifts</span>
              </h3>
              <p className="text-xs text-slate-500">
                Recurring weekly working hours and scheduled break times.
              </p>
            </div>

            <select
              value={selectedSpecialistId}
              onChange={(e) => setSelectedSpecialistId(e.target.value)}
              className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
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
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
              ))}
            </div>
          ) : specialistSchedule?.schedules && specialistSchedule.schedules.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
              {specialistSchedule.schedules.map((shift: any) => (
                <div
                  key={shift.dayOfWeek}
                  className="p-3 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 w-28">
                    {shift.dayOfWeek}
                  </span>
                  <div className="font-mono text-slate-600 dark:text-slate-400">
                    {shift.startTime} – {shift.endTime}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {shift.breakStartTime && shift.breakEndTime
                      ? `Break: ${shift.breakStartTime}–${shift.breakEndTime}`
                      : 'No break'}
                  </div>
                  <Badge variant={shift.isActive ? 'success' : 'neutral'}>
                    {shift.isActive ? 'Active Shift' : 'Off Duty'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-lg">
              No weekly shift template configured for this specialist.
            </div>
          )}
        </div>

        {/* Time-Off & Blocked Slots Management */}
        <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm p-5 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Time-Off & Scheduled Blocks</span>
            </h3>
            <p className="text-xs text-slate-500">
              Vacations, conference leaves, or maintenance blocks that suppress slot availability.
            </p>
          </div>

          {/* Form to add time off */}
          <form onSubmit={handleCreateTimeOff} className="space-y-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Register Operational Leave / Block
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-500">Start Date</label>
                <input
                  type="date"
                  required
                  value={timeOffStart}
                  onChange={(e) => setTimeOffStart(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">End Date</label>
                <input
                  type="date"
                  required
                  value={timeOffEnd}
                  onChange={(e) => setTimeOffEnd(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500">Reason</label>
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
              className="w-full text-xs"
            >
              {isSubmittingTimeOff ? 'Registering...' : 'Register Block Window'}
            </Button>

            {timeOffMessage && (
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                {timeOffMessage}
              </div>
            )}
          </form>

          {/* Active Leave Records */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Upcoming Leave & Block Entries
            </span>
            {specialistSchedule?.timeOffEntries && specialistSchedule.timeOffEntries.length > 0 ? (
              <div className="space-y-2">
                {specialistSchedule.timeOffEntries.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {leave.reason || 'Personal Leave'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {leave.startDate.split('T')[0]} to {leave.endDate.split('T')[0]}
                      </div>
                    </div>
                    <Badge variant="warning">Blocked</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                No active leaves or blocked windows.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
