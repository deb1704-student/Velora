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
import { UserCheck, ShieldCheck, CheckCircle2, XCircle, FileText, Check } from 'lucide-react';

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
    setActionNotice(`Accreditation approved for ${name}. Catalog visibility unlocked and audit logged.`);
  };

  const handleReject = (id: string, name: string) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'REJECTED' } : a))
    );
    setActionNotice(`Application rejected for ${name}. Notification queued.`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748b] block mb-1">
            Trust & Compliance Gateway
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#090d16]">
            Partner KYC & Accreditation Audit
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Audit government identity, certified credentials, and business registrations prior to catalog indexing.
          </p>
        </div>
        <Badge variant="warning" className="self-start sm:self-auto">
          {applicants.filter((a) => a.status === 'PENDING').length} Pending Reviews
        </Badge>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-[4px] border border-[#bbf7d0] bg-[#f0fdf4] text-xs text-[#166534] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16a34a]" />
            <span className="font-medium">{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-[11px] underline text-[#166534] hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      <Tabs defaultValue="SPECIALIST" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#f1f5f9] p-1 rounded-[4px] border border-[#e2e8f0]">
          <TabsTrigger value="SPECIALIST" className="rounded-[3px] text-xs">
            Independent Specialists ({applicants.filter((a) => a.type === 'SPECIALIST').length})
          </TabsTrigger>
          <TabsTrigger value="SALON" className="rounded-[3px] text-xs">
            Salon Ateliers ({applicants.filter((a) => a.type === 'SALON').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filtered.length > 0 ? (
            <div className="rounded-[4px] border border-[#e2e8f0] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Applicant / Entity</TableHead>
                    <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Direct Contact</TableHead>
                    <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Submission Date</TableHead>
                    <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Document Artifacts</TableHead>
                    <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Accreditation</TableHead>
                    <TableHead className="text-right text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Audit Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/80">
                      <TableCell>
                        <div className="font-semibold text-xs text-[#090d16]">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-[#64748b]">
                          {item.type === 'SPECIALIST'
                            ? `${item.experienceYears} Years Trade Exp`
                            : 'Commercial Atelier'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-[#090d16] font-mono">{item.email}</div>
                        <div className="text-[10px] text-[#64748b] font-mono">{item.phone}</div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-[#64748b]">
                        {item.submittedAt}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="flex items-center gap-1 text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 py-0.5 rounded-[3px] font-mono">
                            <Check className="w-2.5 h-2.5" /> ID Verified
                          </span>
                          <span className="flex items-center gap-1 text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-1.5 py-0.5 rounded-[3px] font-mono">
                            <FileText className="w-2.5 h-2.5" /> Certificate
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
                              className="text-[#e11d48] border-[#fecdd3] hover:bg-[#fff1f2] h-7 px-2.5 text-xs rounded-[3px]"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              <span>Reject</span>
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(item.id, item.name)}
                              className="h-7 px-2.5 text-xs rounded-[3px]"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              <span>Approve</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-[#94a3b8]">DECISION LOGGED</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
