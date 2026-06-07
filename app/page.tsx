"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  CreditCard,
  Terminal,
  Plus,
  Search,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Activity,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  Settings,
  Sliders,
  Check,
  RefreshCw,
  LogOut,
  BookOpen,
} from "lucide-react";

/* ────────── Types & Interfaces ────────── */
interface DashboardOverview {
  hubCount: number;
  activeHubCount: number;
  totalAssignedModules: number;
  uniqueAssignedModules: number;
  recentRequestLogCount: number;
  recentPaymentEventCount: number;
}

interface HubDashboardRow {
  id: string;
  name: string;
  slug: string;
  subscriptionPlan: "LAUNCHPAD" | "GROWTH" | "GLOBAL_TRUST" | "BASIC" | "STANDARD" | "PREMIUM";
  subscriptionStatus: string;
  assignedModuleCount: number;
  assignedModules: string[];
  createdAt: string;
}

interface PaymentEventRow {
  id: string;
  stripeEventId: string;
  stripeEventType: string;
  stripeCreatedAt: string;
  hubId: string;
  receivedAt: string;
  payload: string;
}

interface RequestLogRow {
  id: string;
  requestId: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  clientIp: string;
  userAgent: string;
  userId?: string;
  createdAt: string;
}

/* ────────── Initial Mock Data ────────── */
const MOCK_OVERVIEW: DashboardOverview = {
  hubCount: 12,
  activeHubCount: 10,
  totalAssignedModules: 114,
  uniqueAssignedModules: 18,
  recentRequestLogCount: 4210,
  recentPaymentEventCount: 38,
};

const MOCK_HUBS: HubDashboardRow[] = [
  {
    id: "hub-001",
    name: "Acme GRC Laboratories",
    slug: "acme-grc",
    subscriptionPlan: "GLOBAL_TRUST",
    subscriptionStatus: "active",
    assignedModuleCount: 12,
    assignedModules: [
      "watch_tower", "user_lifecycle", "vendor_central", "customer_hub",
      "risk_management", "documentation", "competence_suite", "assurance_audit",
      "strategic_meeting", "continuity_hub", "api_integration", "evidence_vault"
    ],
    createdAt: "2026-01-10T12:00:00Z",
  },
  {
    id: "hub-002",
    name: "Zenith Corp Financials",
    slug: "zenith",
    subscriptionPlan: "GROWTH",
    subscriptionStatus: "active",
    assignedModuleCount: 8,
    assignedModules: [
      "watch_tower", "user_lifecycle", "vendor_central", "documentation",
      "competence_suite", "assurance_audit", "api_integration", "evidence_vault"
    ],
    createdAt: "2026-03-15T09:30:00Z",
  },
  {
    id: "hub-003",
    name: "Stark Enterprises Security",
    slug: "stark-defense",
    subscriptionPlan: "LAUNCHPAD",
    subscriptionStatus: "suspended",
    assignedModuleCount: 4,
    assignedModules: ["watch_tower", "documentation", "competence_suite", "evidence_vault"],
    createdAt: "2026-05-20T16:45:00Z",
  },
  {
    id: "hub-004",
    name: "AuroHost Web Platform",
    slug: "aurohost",
    subscriptionPlan: "LAUNCHPAD",
    subscriptionStatus: "inactive",
    assignedModuleCount: 3,
    assignedModules: ["watch_tower", "user_lifecycle", "documentation"],
    createdAt: "2026-05-28T14:10:00Z",
  }
];

const MOCK_PAYMENTS: PaymentEventRow[] = [
  {
    id: "pay-101",
    stripeEventId: "evt_3Njk87Fds",
    stripeEventType: "invoice.payment_succeeded",
    stripeCreatedAt: "2026-06-04T10:00:00Z",
    hubId: "hub-001",
    receivedAt: "2026-06-04T10:00:05Z",
    payload: JSON.stringify({
      id: "evt_3Njk87Fds",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_12345",
          customer: "cus_Apra11",
          subscription: "sub_GlobalTrustMax",
          amount_paid: 49900,
          currency: "aud",
          status: "paid"
        }
      }
    }, null, 2)
  },
  {
    id: "pay-102",
    stripeEventId: "evt_3Njk88Hyt",
    stripeEventType: "customer.subscription.updated",
    stripeCreatedAt: "2026-06-04T14:15:00Z",
    hubId: "hub-002",
    receivedAt: "2026-06-04T14:15:02Z",
    payload: JSON.stringify({
      id: "evt_3Njk88Hyt",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_ZenithGrowth",
          customer: "cus_Zenith01",
          status: "active",
          items: {
            data: [{ plan: { id: "price_growth_monthly" } }]
          }
        }
      }
    }, null, 2)
  },
  {
    id: "pay-103",
    stripeEventId: "evt_3Njk89Klm",
    stripeEventType: "invoice.payment_failed",
    stripeCreatedAt: "2026-06-04T22:30:00Z",
    hubId: "hub-003",
    receivedAt: "2026-06-04T22:30:10Z",
    payload: JSON.stringify({
      id: "evt_3Njk89Klm",
      type: "invoice.payment_failed",
      data: {
        object: {
          id: "in_67890",
          customer: "cus_StarkDef",
          amount_due: 19900,
          attempt_count: 1,
          next_payment_attempt: 1717548900
        }
      }
    }, null, 2)
  }
];

const MOCK_LOGS: RequestLogRow[] = [
  {
    id: "log-201",
    requestId: "req-f9823e20",
    method: "GET",
    path: "/api/documents",
    status: 200,
    durationMs: 42,
    clientIp: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0",
    userId: "usr-001",
    createdAt: "2026-06-05T00:10:15Z",
  },
  {
    id: "log-202",
    requestId: "req-f9823e21",
    method: "POST",
    path: "/api/documents/templates",
    status: 201,
    durationMs: 184,
    clientIp: "192.168.1.15",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0",
    userId: "usr-001",
    createdAt: "2026-06-05T00:11:00Z",
  },
  {
    id: "log-203",
    requestId: "req-f9823e22",
    method: "GET",
    path: "/api/suppliers",
    status: 500,
    durationMs: 1420,
    clientIp: "203.0.113.80",
    userAgent: "curl/8.4.0",
    createdAt: "2026-06-05T00:12:45Z",
  },
  {
    id: "log-204",
    requestId: "req-f9823e23",
    method: "PATCH",
    path: "/api/suppliers/sup-123/approve",
    status: 403,
    durationMs: 18,
    clientIp: "192.168.1.20",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2026-06-05T00:14:10Z",
  }
];

const MODULE_CATALOG = [
  { id: "watch_tower", name: "Security Watch Tower" },
  { id: "user_lifecycle", name: "User Identity Lifecycle" },
  { id: "vendor_central", name: "Vendor Central Oversight" },
  { id: "customer_hub", name: "Customer Compliance Hub" },
  { id: "risk_management", name: "Enterprise Risk Registers" },
  { id: "documentation", name: "Policy & Document Catalog" },
  { id: "competence_suite", name: "Staff Competence Suite" },
  { id: "assurance_audit", name: "Audit & Fieldwork Assurance" },
  { id: "strategic_meeting", name: "Strategic Committee Tracker" },
  { id: "continuity_hub", name: "Operational Continuity Hub" },
  { id: "api_integration", name: "External API Integration" },
  { id: "evidence_vault", name: "Evidence Vault Registry" },
  { id: "asset_discovery", name: "Asset Discovery Scanner" },
  { id: "ai_empowerment", name: "AI Policy Co-pilot" },
  { id: "support_sla", name: "24/7 Priority Support SLA" },
];

interface AuditFrameworkRow {
  id: string;
  code: string;
  name: string;
  version: string;
  description: string;
  status: "Active" | "Draft";
  controlsCount: number;
}

interface AuditControlItem {
  code: string;
  name: string;
  domain: string;
  desc: string;
}

const INITIAL_FRAMEWORKS: AuditFrameworkRow[] = [
  { id: "fw-1", code: "ISO-27001", name: "ISO/IEC 27001:2022 (ISMS)", version: "2022", description: "Information security management systems standard defining policies, risk assessment, and technical control criteria.", status: "Active", controlsCount: 3 },
  { id: "fw-2", code: "SOC-2", name: "AICPA Trust Services Criteria", version: "v2017", description: "Security, Availability, Processing Integrity, Confidentiality, and Privacy audit criteria for SaaS organizations.", status: "Active", controlsCount: 2 },
  { id: "fw-3", code: "NIST-CSF", name: "NIST Cybersecurity Framework 2.0", version: "v2.0", description: "National Institute of Standards and Technology framework for managing and reducing cybersecurity risk.", status: "Active", controlsCount: 2 },
  { id: "fw-4", code: "HIPAA", name: "HIPAA Security Rule (45 CFR)", version: "v1.2", description: "US federal security standard for protecting electronic protected health information (ePHI).", status: "Draft", controlsCount: 2 }
];

const MOCK_CONTROLS: Record<string, AuditControlItem[]> = {
  "ISO-27001": [
    { code: "A.5.1", name: "Policies for information security", domain: "Organizational Controls", desc: "Information security policy and topic-specific policies shall be defined, approved by management, published and communicated." },
    { code: "A.5.15", name: "Access control", domain: "Organizational Controls", desc: "Rules to control physical and logical access to information and other associated assets shall be established and implemented." },
    { code: "A.8.1", name: "User endpoint devices", domain: "People Controls", desc: "Rules for protecting information processed, stored or accessed via user endpoint devices shall be implemented." }
  ],
  "SOC-2": [
    { code: "CC6.1", name: "Logical Access Control", domain: "Logical and Physical Access", desc: "The entity restricts logical access to information assets, infrastructure, and software to authorized personnel." },
    { code: "CC7.1", name: "Vulnerability Management", domain: "System Operations", desc: "The entity identifies, assesses, and manages vulnerabilities on an ongoing basis." }
  ],
  "NIST-CSF": [
    { code: "GV.OC-01", name: "Organizational Context", domain: "Governance", desc: "The organization's mission, stakeholder expectations, and legal requirements are understood and mapped." },
    { code: "ID.RA-01", name: "Risk Assessment", domain: "Identify", desc: "Vulnerabilities, threat events, and impacts are identified, evaluated, and documented." }
  ],
  "HIPAA": [
    { code: "164.308(a)(1)", name: "Security Management Process", domain: "Administrative Safeguards", desc: "Implement policies and procedures to prevent, detect, contain, and correct security violations." },
    { code: "164.312(a)(1)", name: "Access Control", domain: "Technical Safeguards", desc: "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information." }
  ]
};

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  /* ────────── Navigation & Status States ────────── */
  const [activeTab, setActiveTab] = useState<"overview" | "hubs" | "payments" | "frameworks">("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  /* ────────── Auth Verification Guard ────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (token === "mock-superadmin-jwt-token") {
      setCheckingAuth(false);
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    if (decoded.role !== "SUPER_ADMIN") {
      localStorage.removeItem("token");
      router.push("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  /* ────────── Main Data States ────────── */
  const [overview, setOverview] = useState<DashboardOverview>(MOCK_OVERVIEW);
  const [hubs, setHubs] = useState<HubDashboardRow[]>(MOCK_HUBS);
  const [payments, setPayments] = useState<PaymentEventRow[]>(MOCK_PAYMENTS);
  const [logs, setLogs] = useState<RequestLogRow[]>(MOCK_LOGS);

  /* ────────── Audit Frameworks States ────────── */
  const [frameworks, setFrameworks] = useState<AuditFrameworkRow[]>(INITIAL_FRAMEWORKS);
  const [controlsDb, setControlsDb] = useState<Record<string, AuditControlItem[]>>(MOCK_CONTROLS);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);
  const [isNewFrameworkOpen, setIsNewFrameworkOpen] = useState(false);
  const [frameworkSearchQuery, setFrameworkSearchQuery] = useState("");
  const [frameworkFile, setFrameworkFile] = useState<File | null>(null);
  const [newFrameworkForm, setNewFrameworkForm] = useState({
    code: "",
    name: "",
    version: "",
    description: "",
    year: new Date().getFullYear(),
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    status: "Active" as "Active" | "Draft",
    controlsListString: ""
  });

  /* ────────── Details & Modal Selection States ────────── */
  const [selectedHubId, setSelectedHubId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isNewHubOpen, setIsNewHubOpen] = useState(false);
  const [isEditHubOpen, setIsEditHubOpen] = useState(false);

  /* ────────── Filter & Search Queries ────────── */
  const [hubSearchQuery, setHubSearchQuery] = useState("");
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [logSearchQuery, setLogSearchQuery] = useState("");

  /* ────────── Hub Provisioning Form States ────────── */
  const [newHubForm, setNewHubForm] = useState({
    companyName: "",
    slug: "",
    plan: "LAUNCHPAD" as "LAUNCHPAD" | "GROWTH" | "GLOBAL_TRUST",
    adminEmail: "",
    adminPassword: "",
    firstName: "",
    lastName: "",
    domain: "",
    address: "",
    country: "Australia",
  });

  /* ────────── Hub Management/Editing Form States ────────── */
  const [editHubForm, setEditHubForm] = useState<{
    status: "active" | "inactive" | "suspended";
    plan: "LAUNCHPAD" | "GROWTH" | "GLOBAL_TRUST";
    modules: string[];
  }>({
    status: "active",
    plan: "LAUNCHPAD",
    modules: [],
  });

  /* ────────── API Authorization Headers ────────── */
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const triggerAlert = useCallback((msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 5000);
  }, []);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (token && isConnected) {
      try {
        await fetch("http://localhost:8082/superadmin/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Failed to notify logout to backend", err);
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    router.push("/login");
  }, [isConnected, router]);

  /* ────────── API Fetch Queries ────────── */
  const loadOverview = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8082/superadmin/dashboard/overview", {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const body = await res.json();
        if (body?.data) {
          setOverview(body.data);
          setIsConnected(true);
          return;
        }
      }
      throw new Error("Overview API failed");
    } catch (err) {
      console.warn("Backend Superadmin API unreachable, falling back to mock KPIs (Using Offline Mock Mode)");
      setOverview(MOCK_OVERVIEW);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const loadHubs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8082/superadmin/dashboard/hubs?limit=50", {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const body = await res.json();
        if (body?.data) {
          setHubs(body.data);
          setIsConnected(true);
          return;
        }
      }
      throw new Error("Hubs API failed");
    } catch (err) {
      console.warn("Failed to load hubs list from backend, using mocks");
      setHubs(MOCK_HUBS);
    }
  }, [getAuthHeaders]);

  const loadPayments = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8082/superadmin/dashboard/payments?limit=50", {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const body = await res.json();
        if (body?.data) {
          setPayments(body.data);
          setIsConnected(true);
          return;
        }
      }
      throw new Error("Payments API failed");
    } catch (err) {
      console.warn("Failed to load payments from backend, using mocks");
      setPayments(MOCK_PAYMENTS);
    }
  }, [getAuthHeaders]);

  const loadRequestLogs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8082/superadmin/dashboard/logs?limit=50", {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const body = await res.json();
        if (body?.data) {
          setLogs(body.data);
          setIsConnected(true);
          return;
        }
      }
      throw new Error("Logs API failed");
    } catch (err) {
      console.warn("Failed to load request logs from backend, using mocks");
      setLogs(MOCK_LOGS);
    }
  }, [getAuthHeaders]);

  const loadFrameworks = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8082/superadmin/dashboard/frameworks", {
        headers: getAuthHeaders(),
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (res.ok) {
        const body = await res.json();
        if (body?.data && Array.isArray(body.data)) {
          const mapped = body.data.map((item: any) => ({
            ...item,
            status: item.status || "Active",
            description: item.description || `Global compliance control framework for ${item.name || item.code}.`,
          }));
          setFrameworks(mapped);
          setIsConnected(true);
          return;
        }
      }
      throw new Error("Frameworks API failed");
    } catch (err) {
      console.warn("Failed to load audit frameworks from backend, using mocks");
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!selectedFrameworkId) return;
    const fw = frameworks.find(f => f.code === selectedFrameworkId);
    if (!fw || !fw.id || fw.id.startsWith("fw-")) {
      return;
    }

    const fetchControls = async () => {
      try {
        const res = await fetch(`http://localhost:8082/api/frameworks/${fw.id}/controls`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const body = await res.json();
          if (body?.data && Array.isArray(body.data)) {
            const mapped = body.data.map((c: any) => ({
              code: c.controlCode,
              name: c.title,
              domain: c.domain || "General",
              desc: c.description || "",
            }));
            setControlsDb(prev => ({
              ...prev,
              [fw.code]: mapped,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch controls for framework " + fw.code, err);
      }
    };

    fetchControls();
  }, [selectedFrameworkId, frameworks, getAuthHeaders]);

  /* ────────── Lifecycle Hooks ────────── */
  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === "hubs") {
      loadHubs();
    } else if (activeTab === "payments") {
      loadPayments();
    } else if (activeTab === "frameworks") {
      loadFrameworks();
    }
  }, [activeTab, loadHubs, loadPayments, loadFrameworks]);

  /* ────────── Memos & Filters ────────── */
  const filteredHubs = useMemo(() => {
    return hubs.filter(h => 
      h.name.toLowerCase().includes(hubSearchQuery.toLowerCase()) || 
      h.slug.toLowerCase().includes(hubSearchQuery.toLowerCase()) ||
      h.subscriptionPlan.toLowerCase().includes(hubSearchQuery.toLowerCase())
    );
  }, [hubs, hubSearchQuery]);

  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(f =>
      f.name.toLowerCase().includes(frameworkSearchQuery.toLowerCase()) ||
      f.code.toLowerCase().includes(frameworkSearchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(frameworkSearchQuery.toLowerCase())
    );
  }, [frameworks, frameworkSearchQuery]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => 
      p.stripeEventId.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
      p.stripeEventType.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
      p.hubId.toLowerCase().includes(paymentSearchQuery.toLowerCase())
    );
  }, [payments, paymentSearchQuery]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => 
      l.path.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      l.method.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      String(l.status).includes(logSearchQuery)
    );
  }, [logs, logSearchQuery]);

  const selectedHub = useMemo(() => {
    return hubs.find(h => h.id === selectedHubId) || null;
  }, [hubs, selectedHubId]);

  const selectedPayment = useMemo(() => {
    return payments.find(p => p.id === selectedPaymentId) || null;
  }, [payments, selectedPaymentId]);

  /* ────────── Onboarding & Update Actions ────────── */
  const handleOnboardHubSubmit = async () => {
    const payload = {
      companyName: newHubForm.companyName,
      slug: newHubForm.slug,
      plan: newHubForm.plan,
      adminEmail: newHubForm.adminEmail,
      adminPassword: newHubForm.adminPassword,
      firstName: newHubForm.firstName,
      lastName: newHubForm.lastName,
      domain: newHubForm.domain || null,
      address: newHubForm.address || null,
      country: newHubForm.country,
      timezone: "Australia/Sydney",
    };

    if (isConnected) {
      try {
        const res = await fetch("http://localhost:8082/superadmin/hubs", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        if (res.ok) {
          await loadHubs();
          await loadOverview();
          setIsNewHubOpen(false);
          setNewHubForm({
            companyName: "",
            slug: "",
            plan: "LAUNCHPAD",
            adminEmail: "",
            adminPassword: "",
            firstName: "",
            lastName: "",
            domain: "",
            address: "",
            country: "Australia",
          });
          triggerAlert("Enterprise compliance hub provisioned successfully.");
          return;
        }
      } catch (err) {
        console.error("Backend error creating hub", err);
      }
    }

    // Mock Fallback
    const mockId = `hub-mock-${Date.now()}`;
    const defaultModulesMap = {
      LAUNCHPAD: ["watch_tower", "documentation", "evidence_vault"],
      GROWTH: ["watch_tower", "user_lifecycle", "vendor_central", "documentation", "evidence_vault"],
      GLOBAL_TRUST: ["watch_tower", "user_lifecycle", "vendor_central", "customer_hub", "risk_management", "documentation", "competence_suite", "assurance_audit"]
    };

    const newRow: HubDashboardRow = {
      id: mockId,
      name: payload.companyName,
      slug: payload.slug,
      subscriptionPlan: payload.plan,
      subscriptionStatus: "active",
      assignedModuleCount: defaultModulesMap[payload.plan].length,
      assignedModules: defaultModulesMap[payload.plan],
      createdAt: new Date().toISOString(),
    };

    setHubs(prev => [...prev, newRow]);
    setOverview(prev => ({
      ...prev,
      hubCount: prev.hubCount + 1,
      activeHubCount: prev.activeHubCount + 1,
      totalAssignedModules: prev.totalAssignedModules + newRow.assignedModuleCount
    }));
    setIsNewHubOpen(false);
    triggerAlert("Enterprise hub provisioned locally (Mock Mode).");
  };

  const handleOpenEditHub = (hub: HubDashboardRow) => {
    setSelectedHubId(hub.id);
    setEditHubForm({
      status: (hub.subscriptionStatus === "suspended" ? "suspended" : hub.subscriptionStatus === "inactive" ? "inactive" : "active") as any,
      plan: (hub.subscriptionPlan.startsWith("GLOBAL") ? "GLOBAL_TRUST" : hub.subscriptionPlan.startsWith("GROWTH") ? "GROWTH" : "LAUNCHPAD") as any,
      modules: [...hub.assignedModules],
    });
    setIsEditHubOpen(true);
  };

  const handleUpdateHubConfig = async () => {
    if (!selectedHubId) return;

    if (isConnected) {
      try {
        // 1. Status Update
        const resStatus = await fetch(`http://localhost:8082/superadmin/hubs/${selectedHubId}/status`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: editHubForm.status }),
        });
        if (resStatus.status === 401 || resStatus.status === 403) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        // 2. Plan Update
        await fetch(`http://localhost:8082/superadmin/hubs/${selectedHubId}/subscription`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ plan: editHubForm.plan }),
        });

        // 3. Modules Update
        await fetch(`http://localhost:8082/superadmin/hubs/${selectedHubId}/modules`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ modulesAssigned: editHubForm.modules }),
        });

        await loadHubs();
        await loadOverview();
        setIsEditHubOpen(false);
        triggerAlert("Hub configurations updated successfully.");
        return;
      } catch (err) {
        console.error("Failed to sync status/plan to backend server", err);
      }
    }

    // Mock Fallback
    setHubs(prev => prev.map(h => {
      if (h.id === selectedHubId) {
        return {
          ...h,
          subscriptionStatus: editHubForm.status,
          subscriptionPlan: editHubForm.plan,
          assignedModules: [...editHubForm.modules],
          assignedModuleCount: editHubForm.modules.length,
        };
      }
      return h;
    }));

    setIsEditHubOpen(false);
    triggerAlert("Hub details updated locally (Mock Mode).");
  };

  const toggleModuleSelection = (modId: string) => {
    setEditHubForm(prev => {
      const idx = prev.modules.indexOf(modId);
      if (idx > -1) {
        return { ...prev, modules: prev.modules.filter(m => m !== modId) };
      } else {
        return { ...prev, modules: [...prev.modules, modId] };
      }
    });
  };

  const handleCreateFrameworkSubmit = async () => {
    if (!newFrameworkForm.code || !newFrameworkForm.name) {
      alert("Framework Code and Name are required.");
      return;
    }
    if (!frameworkFile) {
      alert("Please select an Excel template file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", frameworkFile);
    formData.append("name", newFrameworkForm.name);
    formData.append("code", newFrameworkForm.code);
    formData.append("year", String(newFrameworkForm.year));
    formData.append("expiryDate", newFrameworkForm.expiryDate);
    if (newFrameworkForm.version) {
      formData.append("version", newFrameworkForm.version);
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:8082/superadmin/frameworks/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      if (res.ok) {
        triggerAlert("Framework uploaded and registered successfully.");
        setIsNewFrameworkOpen(false);
        setNewFrameworkForm({
          code: "",
          name: "",
          version: "",
          description: "",
          year: new Date().getFullYear(),
          expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
          status: "Active" as "Active" | "Draft",
          controlsListString: ""
        });
        setFrameworkFile(null);
        loadFrameworks();
      } else {
        const errBody = await res.json().catch(() => ({ message: "Unknown error" }));
        alert("Upload failed: " + (errBody.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload framework: " + String(err));
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F0F6F5] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-[#00D4C8]" size={36} />
          <p style={{ fontSize: "14px", color: "#7FA8A3" }} className="animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F0F6F5] flex flex-col font-sans">
      {/* Alert Banner */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 20,
              right: 20,
              background: "rgba(0, 212, 200, 0.15)",
              border: "1px solid #00D4C8",
              padding: "12px 20px",
              borderRadius: "8px",
              color: "#F0F6F5",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              backdropFilter: "blur(10px)",
              boxShadow: "0 0 15px rgba(0, 212, 200, 0.25)"
            }}
          >
            <Zap size={16} color="#00D4C8" />
            {alertMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Shell */}
      <div className="flex flex-1" style={{ height: "100vh", overflow: "hidden" }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="sidebar-transition bg-[#0a0a0a] border-r border-[rgba(0,212,200,0.08)] flex flex-col" style={{ padding: isSidebarCollapsed ? "24px 12px 130px 12px" : "24px 20px 130px 20px", width: isSidebarCollapsed ? "80px" : "260px", position: "relative", flexShrink: 0 }}>
          {/* Collapsible toggle button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              position: "absolute",
              right: "-12px",
              top: "28px",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "#111111",
              border: "1px solid rgba(0, 212, 200, 0.2)",
              boxShadow: "0 0 10px rgba(0, 212, 200, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#00D4C8",
              zIndex: 50,
              transition: "all 0.2s ease"
            }}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Scrollable Top Wrapper */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: isSidebarCollapsed ? "center" : "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #00D4C8, #00A89E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#050505", fontWeight: 800, flexShrink: 0 }}>
                <Shield size={16} color="#050505" />
              </div>
              {!isSidebarCollapsed && (
                <span className="fade-transition" style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                  Compli<span style={{ color: "#00D4C8" }}>Auro</span> <span style={{ fontSize: "9px", verticalAlign: "super", background: "rgba(0, 212, 200, 0.15)", color: "#00D4C8", padding: "1px 4px", borderRadius: "4px" }}>Admin</span>
                </span>
              )}
            </div>

            {/* Menu Items */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => setActiveTab("overview")}
                className={`btn ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: "10px", border: "none", background: activeTab === "overview" ? "" : "transparent", padding: isSidebarCollapsed ? "10px 0" : "8px 16px" }}
                title={isSidebarCollapsed ? "Dashboard Overview" : undefined}
              >
                <LayoutDashboard size={16} style={{ flexShrink: 0 }} />
                {!isSidebarCollapsed && <span className="fade-transition" style={{ whiteSpace: "nowrap" }}>Dashboard Overview</span>}
              </button>

              <button
                onClick={() => setActiveTab("hubs")}
                className={`btn ${activeTab === "hubs" ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: "10px", border: "none", background: activeTab === "hubs" ? "" : "transparent", padding: isSidebarCollapsed ? "10px 0" : "8px 16px" }}
                title={isSidebarCollapsed ? "Hubs & Tenants" : undefined}
              >
                <Layers size={16} style={{ flexShrink: 0 }} />
                {!isSidebarCollapsed && <span className="fade-transition" style={{ whiteSpace: "nowrap" }}>Hubs & Tenants</span>}
              </button>

              <button
                onClick={() => setActiveTab("frameworks")}
                className={`btn ${activeTab === "frameworks" ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: "10px", border: "none", background: activeTab === "frameworks" ? "" : "transparent", padding: isSidebarCollapsed ? "10px 0" : "8px 16px" }}
                title={isSidebarCollapsed ? "Audit Frameworks" : undefined}
              >
                <BookOpen size={16} style={{ flexShrink: 0 }} />
                {!isSidebarCollapsed && <span className="fade-transition" style={{ whiteSpace: "nowrap" }}>Audit Frameworks</span>}
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={`btn ${activeTab === "payments" ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", justifyContent: isSidebarCollapsed ? "center" : "flex-start", gap: "10px", border: "none", background: activeTab === "payments" ? "" : "transparent", padding: isSidebarCollapsed ? "10px 0" : "8px 16px" }}
                title={isSidebarCollapsed ? "Stripe Payment Logs" : undefined}
              >
                <CreditCard size={16} style={{ flexShrink: 0 }} />
                {!isSidebarCollapsed && <span className="fade-transition" style={{ whiteSpace: "nowrap" }}>Stripe Payment Logs</span>}
              </button>
            </nav>
          </div>

          {/* Footer User & Quick Settings */}
          <div style={{ position: "absolute", bottom: "16px", left: isSidebarCollapsed ? "12px" : "20px", right: isSidebarCollapsed ? "12px" : "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "#0a0a0a", alignItems: isSidebarCollapsed ? "center" : "stretch", transition: "left 0.3s ease, right 0.3s ease" }}>
            {/* User Profile Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: isSidebarCollapsed ? "center" : "flex-start" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0, 212, 200, 0.1)", border: "1px solid #00D4C8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "12px", color: "#00D4C8", flexShrink: 0 }}>
                SA
              </div>
              {!isSidebarCollapsed && (
                <div className="fade-transition" style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap" }}>Super Admin</span>
                  <span style={{ fontSize: "10px", color: "#7FA8A3", whiteSpace: "nowrap" }}>Platform Control</span>
                </div>
              )}
            </div>

            {/* Settings & Logout Buttons */}
            <div style={{ display: "flex", flexDirection: isSidebarCollapsed ? "column" : "row", gap: "8px", width: "100%" }}>
              <button
                onClick={() => alert("Settings panel opening... (Under Development)")}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)", height: "32px", background: "rgba(255,255,255,0.02)" }}
                title={isSidebarCollapsed ? "Settings" : undefined}
              >
                <Settings size={12} />
                {!isSidebarCollapsed && <span className="fade-transition" style={{ whiteSpace: "nowrap" }}>Settings</span>}
              </button>
              <button
                onClick={handleLogout}
                className="btn"
                style={{ flex: 1, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", borderRadius: "6px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", color: "#ef4444", height: "32px" }}
              >
                <LogOut size={12} /> Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-1 flex flex-col bg-[#050505] pl-8 pr-5 pt-8 pb-5 overflow-y-auto">
          {/* Header Dashboard Banner */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800 }}>Platform Control Center</h1>
              <p style={{ fontSize: "13px", color: "#7FA8A3", marginTop: "2px" }}>Provision enterprise tenants, manage assigned compliance modules, and audit transaction streams.</p>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: isConnected ? "rgba(34, 197, 94, 0.08)" : "rgba(251, 191, 36, 0.08)",
                  border: isConnected ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(251, 191, 36, 0.2)",
                  color: isConnected ? "#22c55e" : "#fbbf24",
                  padding: "5px 10px",
                  borderRadius: "12px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isConnected ? "#22c55e" : "#fbbf24" }} />
                {isConnected ? "Cloud Connected" : "Local Mock Mode"}
              </span>
            </div>
          </header>

          {/* TAB PANEL 1: OVERVIEW METRICS */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* KPIs Grid */}
              <div className="overview-kpi-grid">
                <div className="kpi-card" style={{ borderLeft: "3px solid #00D4C8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Provisioned Hubs</span>
                    <Layers size={16} style={{ color: "#00D4C8", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#00D4C8", marginTop: "2px" }}>{overview.hubCount}</span>
                </div>
                <div className="kpi-card" style={{ borderLeft: "3px solid #22c55e" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Active Tenants</span>
                    <Shield size={16} style={{ color: "#22c55e", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#22c55e", marginTop: "2px" }}>{overview.activeHubCount}</span>
                </div>
                <div className="kpi-card" style={{ borderLeft: "3px solid #c084fc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Assigned Module Instances</span>
                    <Sliders size={16} style={{ color: "#c084fc", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#c084fc", marginTop: "2px" }}>{overview.totalAssignedModules}</span>
                </div>
                <div className="kpi-card" style={{ borderLeft: "3px solid #fbbf24" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Audited Request Streams</span>
                    <Activity size={16} style={{ color: "#fbbf24", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#fbbf24", marginTop: "2px" }}>{overview.recentRequestLogCount}</span>
                </div>
              </div>

              {/* Platform Activity Feed Charts Row */}
              <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "16px" }}>
                
                {/* Recent Platform Health logs */}
                <div className="glass-panel" style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "14.5px", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Activity size={16} color="#00D4C8" /> Recent System Operations
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { type: "info", text: "Stripe payment succeeded event for client Zenith Corp.", time: "10 mins ago" },
                      { type: "warning", text: "Tenant Stark Enterprises GRC marked as suspended due to payment failure.", time: "1 hour ago" },
                      { type: "info", text: "New self-service registration draft created for client AuroHost.", time: "3 hours ago" },
                      { type: "success", text: "Compliance module customer_hub assigned to Zenel Corp Hub.", time: "6 hours ago" }
                    ].map((act, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "7px 12px", borderRadius: "8px", fontSize: "12.5px" }}>
                        <span style={{
                          color: act.type === "warning" ? "#fbbf24" : act.type === "success" ? "#22c55e" : "#00D4C8",
                          fontWeight: 700
                        }}>[{act.type.toUpperCase()}]</span>
                        <div style={{ flex: 1, color: "#B0D4D0" }}>{act.text}</div>
                        <span style={{ fontSize: "11px", color: "#7FA8A3" }}>{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscriptions Plans Division */}
                <div className="glass-panel" style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: "14.5px", fontWeight: 700, marginBottom: "10px" }}>Plan Distribution</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { name: "Global Trust (Enterprise)", count: 4, pct: 33, color: "#fbbf24" },
                      { name: "Growth Scale Plan", count: 5, pct: 42, color: "#c084fc" },
                      { name: "LaunchPad Starter Plan", count: 3, pct: 25, color: "#00D4C8" }
                    ].map((plan, i) => (
                      <div key={i} style={{ fontSize: "12.5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#B0D4D0", marginBottom: "2px" }}>
                          <span>{plan.name}</span>
                          <strong>{plan.count} Hubs ({plan.pct}%)</strong>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                          <div style={{ width: `${plan.pct}%`, height: "6px", background: plan.color, borderRadius: "3px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB PANEL 2: HUBS & TENANTS REGISTRY */}
          {activeTab === "hubs" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Toolbar */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#0a0a0a", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "12px 20px", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <Search size={16} color="#7FA8A3" />
                  <input
                    className="form-input"
                    style={{ border: "none", background: "none", fontSize: "13px", padding: 0 }}
                    placeholder="Search tenant registries by client name or slug..."
                    value={hubSearchQuery}
                    onChange={e => setHubSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  onClick={() => setIsNewHubOpen(true)}
                >
                  <Plus size={16} color="#050505" /> Provision Hub
                </button>
              </div>

              {/* Data Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Hub Name</th>
                      <th>Sub-Domain Slug</th>
                      <th>Active Plan</th>
                      <th>Modules</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th style={{ textAlign: "right" }}>Management Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHubs.map(hub => (
                      <tr key={hub.id}>
                        <td style={{ fontWeight: 700, color: "#fff" }}>{hub.name}</td>
                        <td style={{ fontFamily: "monospace" }}>{hub.slug}.compliauro.com</td>
                        <td>
                          <span className={`plan-badge ${hub.subscriptionPlan.toLowerCase()}`}>
                            {hub.subscriptionPlan.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>{hub.assignedModuleCount} modules</td>
                        <td>
                          <span className={`status-badge ${hub.subscriptionStatus.toLowerCase()}`}>
                            {hub.subscriptionStatus}
                          </span>
                        </td>
                        <td>{new Date(hub.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", gap: "4px" }}
                            onClick={() => handleOpenEditHub(hub)}
                          >
                            <Sliders size={11} /> Configure Hub
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredHubs.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", fontStyle: "italic", color: "#7FA8A3" }}>
                          No enterprise hubs match search queries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB PANEL 3: PAYMENT LOGS */}
          {activeTab === "payments" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Search Toolbar */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#0a0a0a", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "12px 20px", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <Search size={16} color="#7FA8A3" />
                  <input
                    className="form-input"
                    style={{ border: "none", background: "none", fontSize: "13px", padding: 0 }}
                    placeholder="Search Stripe logs by event ID or event type..."
                    value={paymentSearchQuery}
                    onChange={e => setPaymentSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Payments Split Pane List */}
              <div style={{ display: "grid", gridTemplateColumns: selectedPaymentId ? "3fr 2fr" : "1fr", gap: "20px" }}>
                
                {/* List Table */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Stripe Event ID</th>
                        <th>Event Name/Type</th>
                        <th>Hub Association</th>
                        <th>Received At</th>
                        <th style={{ textAlign: "right" }}>Raw Response</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map(p => (
                        <tr key={p.id} style={{ background: selectedPaymentId === p.id ? "rgba(0, 212, 200, 0.02)" : "" }}>
                          <td style={{ fontWeight: 700, fontFamily: "monospace" }}>{p.stripeEventId}</td>
                          <td>
                            <span style={{
                              color: p.stripeEventType.includes("failed") ? "#ef4444" : "#00D4C8",
                              fontWeight: 600
                            }}>
                              {p.stripeEventType}
                            </span>
                          </td>
                          <td>{p.hubId}</td>
                          <td>{new Date(p.receivedAt).toLocaleString()}</td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", gap: "4px" }}
                              onClick={() => setSelectedPaymentId(p.id)}
                            >
                              <Eye size={12} /> Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Inspect Details Pane */}
                {selectedPaymentId && selectedPayment && (
                  <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 212, 200, 0.1)", paddingBottom: "10px", marginBottom: "14px" }}>
                      <h3 style={{ fontSize: "13.5px", fontWeight: 700 }}>Webhook Payload Details</h3>
                      <button className="findings-panel-close" onClick={() => setSelectedPaymentId(null)}><X size={16} /></button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "12px", color: "#7FA8A3" }}>
                        Event: <strong style={{ color: "#fff" }}>{selectedPayment.stripeEventType}</strong>
                      </div>
                      <div style={{ fontSize: "12px", color: "#7FA8A3" }}>
                        Stripe ID: <strong style={{ color: "#fff" }}>{selectedPayment.stripeEventId}</strong>
                      </div>
                      <pre style={{
                        background: "#050505",
                        border: "1px solid rgba(255,255,255,0.05)",
                        padding: "12px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        color: "#00D4C8",
                        overflowX: "auto",
                        maxHeight: "350px"
                      }}>
                        {selectedPayment.payload}
                      </pre>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB PANEL 4: AUDIT FRAMEWORKS */}
          {activeTab === "frameworks" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* KPIs Grid */}
              <div className="overview-kpi-grid">
                <div className="kpi-card" style={{ borderLeft: "3px solid #00D4C8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Active Frameworks</span>
                    <BookOpen size={16} style={{ color: "#00D4C8", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#00D4C8", marginTop: "2px" }}>
                    {frameworks.length}
                  </span>
                </div>
                <div className="kpi-card" style={{ borderLeft: "3px solid #22c55e" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Total Mapped Controls</span>
                    <Shield size={16} style={{ color: "#22c55e", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#22c55e", marginTop: "2px" }}>
                    {frameworks.reduce((acc, curr) => acc + curr.controlsCount, 0)}
                  </span>
                </div>
                <div className="kpi-card" style={{ borderLeft: "3px solid #fbbf24" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="kpi-label">Draft Frameworks</span>
                    <AlertTriangle size={16} style={{ color: "#fbbf24", opacity: 0.8 }} />
                  </div>
                  <span className="kpi-value" style={{ color: "#fbbf24", marginTop: "2px" }}>
                    {frameworks.filter(f => f.status === "Draft").length}
                  </span>
                </div>
              </div>

              {/* Search & Actions Toolbar */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", background: "#0a0a0a", border: "1px solid rgba(255, 255, 255, 0.04)", padding: "10px 16px", borderRadius: "12px", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "400px" }}>
                  <Search size={16} color="#7FA8A3" />
                  <input
                    className="form-input"
                    style={{ border: "none", background: "none", fontSize: "13px", padding: 0 }}
                    placeholder="Search frameworks by name, code, or description..."
                    value={frameworkSearchQuery}
                    onChange={e => setFrameworkSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ display: "inline-flex", gap: "6px", fontSize: "12px", padding: "8px 14px", height: "36px" }}
                  onClick={() => setIsNewFrameworkOpen(true)}
                >
                  <Plus size={14} /> Register Framework
                </button>
              </div>

              {/* Frameworks Catalog Table */}
              <div style={{ display: "grid", gridTemplateColumns: selectedFrameworkId ? "3fr 2fr" : "1fr", gap: "16px" }}>
                
                {/* List Container */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Framework Title</th>
                        <th>Version</th>
                        <th>Description</th>
                        <th>Controls</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFrameworks.map(f => (
                        <tr key={f.id} style={{ background: selectedFrameworkId === f.code ? "rgba(0, 212, 200, 0.02)" : "" }}>
                          <td style={{ fontWeight: 700, color: "#00D4C8" }}>{f.code}</td>
                          <td style={{ fontWeight: 600, color: "#fff" }}>{f.name}</td>
                          <td>{f.version}</td>
                          <td style={{ fontSize: "12px", color: "#7FA8A3", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.description}>
                            {f.description}
                          </td>
                          <td style={{ fontWeight: 700 }}>{f.controlsCount} controls</td>
                          <td>
                            <span className={`status-badge ${f.status.toLowerCase()}`}>
                              {f.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "4px 8px", fontSize: "11px", display: "inline-flex", gap: "4px" }}
                              onClick={() => setSelectedFrameworkId(selectedFrameworkId === f.code ? null : f.code)}
                            >
                              <Eye size={12} /> {selectedFrameworkId === f.code ? "Close Controls" : "View Controls"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredFrameworks.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#7FA8A3" }}>
                            No audit frameworks match your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Controls Mappings Side Drawer / Detail Pane */}
                {selectedFrameworkId && (
                  <div className="glass-panel" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-start", height: "fit-content" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 212, 200, 0.1)", paddingBottom: "10px", marginBottom: "12px" }}>
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#00D4C8" }}>
                          {selectedFrameworkId} Controls
                        </h3>
                        <p style={{ fontSize: "11px", color: "#7FA8A3", marginTop: "2px" }}>
                          {frameworks.find(f => f.code === selectedFrameworkId)?.name}
                        </p>
                      </div>
                      <button
                        className="findings-panel-close"
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#7FA8A3" }}
                        onClick={() => setSelectedFrameworkId(null)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto", maxHeight: "360px", paddingRight: "4px" }}>
                      {(controlsDb[selectedFrameworkId] || []).map((control, idx) => (
                        <div key={idx} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "10px 12px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, background: "rgba(0, 212, 200, 0.1)", color: "#00D4C8", padding: "2px 6px", borderRadius: "4px" }}>
                              {control.code}
                            </span>
                            <span style={{ fontSize: "10.5px", color: "#7FA8A3", fontWeight: 500 }}>
                              {control.domain}
                            </span>
                          </div>
                          <h4 style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", margin: 0 }}>
                            {control.name}
                          </h4>
                          <p style={{ fontSize: "11.5px", color: "#7FA8A3", margin: 0, lineHeight: 1.4 }}>
                            {control.desc}
                          </p>
                        </div>
                      ))}
                      {(!controlsDb[selectedFrameworkId] || controlsDb[selectedFrameworkId].length === 0) && (
                        <div style={{ textAlign: "center", padding: "20px", color: "#7FA8A3", fontSize: "12px" }}>
                          No controls mapped to this framework instance yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}



        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: PROVISION ENTERPRISE TENANT HUB
          ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isNewHubOpen && (
          <div className="modal-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{ width: "90%", maxWidth: "680px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}
            >
              <div className="modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0, 212, 200, 0.15)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Provision Compliance Tenant Hub</h2>
                <button className="findings-panel-close" onClick={() => setIsNewHubOpen(false)}><X size={18} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Corporate Name</label>
                    <input
                      className="form-input"
                      value={newHubForm.companyName}
                      onChange={e => setNewHubForm(p => ({ ...p, companyName: e.target.value }))}
                      placeholder="E.g., Stark Industries Defense"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Domain Slug</label>
                    <input
                      className="form-input"
                      value={newHubForm.slug}
                      onChange={e => setNewHubForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                      placeholder="stark-defense"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Platform Plan Tier</label>
                    <select
                      className="form-input"
                      value={newHubForm.plan}
                      onChange={e => setNewHubForm(p => ({ ...p, plan: e.target.value as any }))}
                    >
                      <option value="LAUNCHPAD">LaunchPad (Starter)</option>
                      <option value="GROWTH">Growth (Scale)</option>
                      <option value="GLOBAL_TRUST">Global Trust (Enterprise)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Web Domain</label>
                    <input
                      className="form-input"
                      value={newHubForm.domain}
                      onChange={e => setNewHubForm(p => ({ ...p, domain: e.target.value }))}
                      placeholder="stark.com"
                    />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                  <h3 style={{ fontSize: "12.5px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Tenant Initial Administrator</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        className="form-input"
                        value={newHubForm.firstName}
                        onChange={e => setNewHubForm(p => ({ ...p, firstName: e.target.value }))}
                        placeholder="Tony"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        className="form-input"
                        value={newHubForm.lastName}
                        onChange={e => setNewHubForm(p => ({ ...p, lastName: e.target.value }))}
                        placeholder="Stark"
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", marginTop: "10px" }}>
                    <div className="form-group">
                      <label className="form-label">Admin Email Address</label>
                      <input
                        className="form-input"
                        type="email"
                        value={newHubForm.adminEmail}
                        onChange={e => setNewHubForm(p => ({ ...p, adminEmail: e.target.value }))}
                        placeholder="t.stark@stark.com"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Admin Security Password</label>
                      <input
                        className="form-input"
                        type="password"
                        value={newHubForm.adminPassword}
                        onChange={e => setNewHubForm(p => ({ ...p, adminPassword: e.target.value }))}
                        placeholder="Min 8 characters"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input
                      className="form-input"
                      value={newHubForm.address}
                      onChange={e => setNewHubForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="10880 Wilshire Blvd"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      className="form-input"
                      value={newHubForm.country}
                      onChange={e => setNewHubForm(p => ({ ...p, country: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(0, 212, 200, 0.15)", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#060606" }}>
                <button className="panel-action" style={{ padding: "8px 16px" }} onClick={() => setIsNewHubOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleOnboardHubSubmit}>Provision Hub</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: EDIT TENANT CONFIGURATIONS (STATUS, SUBSCRIPTION, MODULES)
          ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditHubOpen && selectedHub && (
          <div className="modal-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{ width: "90%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}
            >
              <div className="modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0, 212, 200, 0.15)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Configure Hub: {selectedHub.name}</h2>
                <button className="findings-panel-close" onClick={() => setIsEditHubOpen(false)}><X size={18} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Status & Plan Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Subscription Status</label>
                    <select
                      className="form-input"
                      value={editHubForm.status}
                      onChange={e => setEditHubForm(p => ({ ...p, status: e.target.value as any }))}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subscription Plan Tier</label>
                    <select
                      className="form-input"
                      value={editHubForm.plan}
                      onChange={e => setEditHubForm(p => ({ ...p, plan: e.target.value as any }))}
                    >
                      <option value="LAUNCHPAD">LaunchPad (Starter)</option>
                      <option value="GROWTH">Growth (Scale)</option>
                      <option value="GLOBAL_TRUST">Global Trust (Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Modules Assigned List */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                  <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>Assign Modules Access</label>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "250px", overflowY: "auto", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.05)", padding: "10px", borderRadius: "8px" }}>
                    {MODULE_CATALOG.map(mod => {
                      const isChecked = editHubForm.modules.includes(mod.id);
                      return (
                        <div
                          key={mod.id}
                          onClick={() => toggleModuleSelection(mod.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 10px",
                            background: isChecked ? "rgba(0, 212, 200, 0.04)" : "transparent",
                            border: isChecked ? "1px solid rgba(0, 212, 200, 0.15)" : "1px solid transparent",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12.5px"
                          }}
                        >
                          <div style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "3px",
                            border: "1.5px solid #00D4C8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isChecked ? "#00D4C8" : "transparent"
                          }}>
                            {isChecked && <Check size={10} color="#050505" strokeWidth={4} />}
                          </div>
                          <span style={{ color: isChecked ? "#fff" : "#B0D4D0" }}>{mod.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(0, 212, 200, 0.15)", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#060606" }}>
                <button className="panel-action" style={{ padding: "8px 16px" }} onClick={() => setIsEditHubOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleUpdateHubConfig}>Save Configurations</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────────
          MODAL: REGISTER AUDIT FRAMEWORK
          ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isNewFrameworkOpen && (
          <div className="modal-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel"
              style={{ width: "90%", maxWidth: "600px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}
            >
              <div className="modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0, 212, 200, 0.15)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Register Audit Compliance Framework</h2>
                <button className="findings-panel-close" onClick={() => setIsNewFrameworkOpen(false)}><X size={18} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Framework Title / Name</label>
                    <input
                      className="form-input"
                      value={newFrameworkForm.name}
                      onChange={e => setNewFrameworkForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="E.g., ISO/IEC 27001:2022 (ISMS)"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Framework Code</label>
                    <input
                      className="form-input"
                      value={newFrameworkForm.code}
                      onChange={e => setNewFrameworkForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") }))}
                      placeholder="E.g., ISO-27001"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Version</label>
                    <input
                      className="form-input"
                      value={newFrameworkForm.version}
                      onChange={e => setNewFrameworkForm(p => ({ ...p, version: e.target.value }))}
                      placeholder="E.g., 2022 or v2.0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Status</label>
                    <select
                      className="form-input"
                      value={newFrameworkForm.status}
                      onChange={e => setNewFrameworkForm(p => ({ ...p, status: e.target.value as any }))}
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Framework Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newFrameworkForm.year}
                      onChange={e => setNewFrameworkForm(p => ({ ...p, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      placeholder="E.g., 2015"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newFrameworkForm.expiryDate}
                      onChange={e => setNewFrameworkForm(p => ({ ...p, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Framework Description</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: "80px", resize: "vertical" }}
                    value={newFrameworkForm.description}
                    onChange={e => setNewFrameworkForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of the compliance requirements and scope..."
                  />
                </div>

                <div className="form-group" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "14px" }}>
                  <label className="form-label">Upload Framework Excel Template (.xlsx)</label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".xlsx, .xls"
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFrameworkFile(e.target.files[0]);
                      }
                    }}
                    style={{ padding: "8px" }}
                  />
                  <span style={{ fontSize: "11px", color: "#7FA8A3", marginTop: "4px" }}>
                    Select an Excel sheet with columns for Control ID, Control Name, Key Requirements, and Domain.
                  </span>
                </div>
              </div>

              <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(0, 212, 200, 0.15)", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#060606" }}>
                <button className="panel-action" style={{ padding: "8px 16px" }} onClick={() => setIsNewFrameworkOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleCreateFrameworkSubmit}>Register Framework</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
