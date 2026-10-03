'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Button,
  EmptyState,
} from '@velora/ui';
import { UserCheck, ShieldCheck, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface VerificationApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'SPECIALIST' | 'SALON';
  experienceYears?: number;
  submittedAt: string;
  idProofUploaded: boolean;
  certificateUploaded: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const SAMPLE_APPLICANTS: VerificationApplicant[] = [
  {
    id: 'app-01',
    name: 'Kavita Nair',
    email: 'kavita.nair@example.com',
    phone: '+91 98450 11223',
    type: 'SPECIALIST',
    experienceYears: 5,
    submittedAt: '2026-10-02',
    idProofUploaded: true,
    certificateUploaded: true,
    status: 'PENDING',
  },
  {
    id: 'app-02',
    name: 'Serene Haven Spa & Salon',
    email: 'contact@serenehaven.in',
    phone: '+91 99800 44556',
    type: 'SALON',
    submittedAt: '2026-10-01',
    idProofUploaded: true,
    certificateUploaded: true,
    status: 'PENDING',
  },
];

export default function VerificationsPage() {
  const [activeTab, setActiveTab] = React.useState('SPECIALIST');
  const [applicants, setApplicants] = React.useState<VerificationApplicant[]>(SAMPLE_APPLICANTS);
  const [actionNotice, setActionNotice] = React.useState<string | null>(null);

  const filtered = applicants.filter((a) => a.type === activeTab);

  const handleApprove = (id: string, name: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'APPROVED' } : a))
    );
    setActionNotice(`Application for ${name} marked as APPROVED. Audit log entry recorded.`);
  };

  const handleReject = (id: string, name: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a))
    );
    setActionNotice(`Application for ${name} marked as REJECTED.`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Partner KYC & Accreditation Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit identity documentation, trade certifications, and business registrations prior to catalog listing.
          </p>
        </div>
        <Badge variant="warning" className="self-start">
          {applicants.filter((a) => a.status === 'PENDING').length} Pending Reviews
        </Badge>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      <Tabs defaultValue="SPECIALIST" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="SPECIALIST">Independent Specialists</TabsTrigger>
          <TabsTrigger value="SALON">Salon Businesses</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant / Entity</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Document Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.type === 'SPECIALIST'
                          ? `${item.experienceYears} Years Exp`
                          : 'Commercial Salon Studio'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-slate-800 dark:text-slate-200">{item.email}</div>
                      <div className="text-[11px] text-slate-500">{item.phone}</div>
                    </TableCell>

                    <TableCell className="font-mono text-slate-600 dark:text-slate-400">
                      {item.submittedAt}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Identity ID
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          <FileText className="w-3 h-3" /> Certificate
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {item.status === 'PENDING' ? (
                        <Badge variant="warning">Pending Review</Badge>
                      ) : item.status === 'APPROVED' ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(item.id, item.name)}
                            className="text-rose-700 border-rose-200 hover:bg-rose-50"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Reject</span>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(item.id, item.name)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            <span>Approve</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Decision Recorded</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={UserCheck}
              title="Verification Queue Clean"
              description={`There are currently no pending ${activeTab.toLowerCase()} verification submissions requiring audit.`}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
