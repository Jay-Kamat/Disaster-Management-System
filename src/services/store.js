// Reactive In-Memory Data Store for Disaster Relief Platform
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

// Seed disaster reports
const INITIAL_REPORTS = [
  {
    id: "REP-2026-001",
    category: "flood",
    title: "Severe Urban Waterlogging & Stranded Families",
    description: "Rising floodwaters (approx 4ft) in low-lying residential areas. Around 15 families stranded on top floors needing drinking water & food packets.",
    lat: 19.0760,
    lng: 72.8777,
    locationName: "Kurla West, Mumbai, Maharashtra",
    severity: "high",
    trappedCount: 15,
    timestamp: "2026-07-24T08:30:00Z",
    status: "verified",
    flags: 0,
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    aiAnalysis: {
      damageType: "Flood / Waterlogging",
      severity: "Severe",
      confidence: 94,
      details: "High water coverage detected relative to structural bases; potential electrical risk."
    }
  },
  {
    id: "REP-2026-002",
    category: "landslide",
    title: "Hillside Debris Collapse Blocking Access Road",
    description: "Mudslide triggered by heavy torrential rain. Road to primary health center blocked. Local village cut off.",
    lat: 18.5204,
    lng: 73.8567,
    locationName: "Tamhini Ghat Road, Pune District",
    severity: "high",
    trappedCount: 8,
    timestamp: "2026-07-24T06:15:00Z",
    status: "verified",
    flags: 0,
    photoUrl: "https://images.unsplash.com/photo-1590055531615-f16d36ffe8ec?auto=format&fit=crop&w=800&q=80",
    aiAnalysis: {
      damageType: "Debris / Landslide",
      severity: "Moderate",
      confidence: 89,
      details: "Soil instability and road blockage detected."
    }
  },
  {
    id: "REP-2026-003",
    category: "fire",
    title: "Commercial Warehouse Structural Fire",
    description: "Smoke plume visible across 2km radius. Fire tenders on site, emergency medical support required.",
    lat: 19.2183,
    lng: 72.9781,
    locationName: "Thane Industrial Zone, Maharashtra",
    severity: "high",
    trappedCount: 3,
    timestamp: "2026-07-24T09:00:00Z",
    status: "verified",
    flags: 1,
    photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    aiAnalysis: {
      damageType: "Fire / Thermal Damage",
      severity: "Severe",
      confidence: 96,
      details: "Flame radiation signature and heavy smoke density."
    }
  },
  {
    id: "REP-2026-004",
    category: "cyclone",
    title: "Coastal Storm Damage & Fallen Power Infrastructure",
    description: "Strong gale winds uprooted trees and damaged corrugated roofs. Power outage across 3 sub-districts.",
    lat: 18.9220,
    lng: 72.8347,
    locationName: "Colaba Coastal Belt, Mumbai",
    severity: "medium",
    trappedCount: 0,
    timestamp: "2026-07-24T07:45:00Z",
    status: "unverified",
    flags: 0,
    photoUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80",
    aiAnalysis: {
      damageType: "Structural / Wind Damage",
      severity: "Moderate",
      confidence: 85,
      details: "Tree downfall and minor roof detachment."
    }
  }
];

// Seed shelters
const INITIAL_SHELTERS = [
  {
    id: "SHL-01",
    name: "Dr. B.R. Ambedkar Community Center & Relief Camp",
    locationName: "Kurla West, Near Station, Mumbai",
    lat: 19.0720,
    lng: 72.8720,
    totalCapacity: 350,
    occupiedBeds: 180,
    contactPerson: "Rajesh Shinde (Camp Commander)",
    phone: "+91 98201 44321",
    amenities: ["Clean Water", "Medical Desk", "Hot Meals", "Women & Children Ward", "Power Generators"],
    status: "open"
  },
  {
    id: "SHL-02",
    name: "Shivaji Park Municipal High School Refuge Facility",
    locationName: "Dadar West, Mumbai",
    lat: 19.0269,
    lng: 72.8373,
    totalCapacity: 500,
    occupiedBeds: 420,
    contactPerson: "Meena Kulkarni",
    phone: "+91 98190 88765",
    amenities: ["Medical Desk", "Dry Rations", "Infant Milk", "Sanitary Supplies"],
    status: "open"
  },
  {
    id: "SHL-03",
    name: "Pune Municipal Indoor Sports Complex",
    locationName: "Shivajinagar, Pune",
    lat: 18.5308,
    lng: 73.8474,
    totalCapacity: 600,
    occupiedBeds: 150,
    contactPerson: "Vikram Patil",
    phone: "+91 97640 12345",
    amenities: ["Doctor On Duty", "Wheelchair Accessible", "Charging Stations", "Counseling Desk"],
    status: "open"
  }
];

// Seed rescue units
const INITIAL_RESCUE_UNITS = [
  {
    id: "NDRF-BN-05",
    name: "NDRF 5th Battalion Team Alpha",
    type: "National Disaster Response Force",
    lat: 19.0800,
    lng: 72.8850,
    contact: "+91 1078 (NDRF Toll-Free)",
    status: "Active Deployment",
    personnel: 24,
    boats: 4
  },
  {
    id: "SDRF-MH-02",
    name: "State Disaster Response Force - Fire & Rescue",
    type: "SDRF Emergency Unit",
    lat: 18.5250,
    lng: 73.8600,
    contact: "101 / 112 Emergency",
    status: "En Route to Landslide",
    personnel: 18,
    heavyEquipment: 2
  }
];

// Seed missing persons
const INITIAL_MISSING_PERSONS = [
  {
    id: "MIS-101",
    name: "Aarav Sharma",
    age: 12,
    gender: "Male",
    lastSeenLocation: "Kurla West Market area during flood evacuation",
    lastSeenDate: "2026-07-24 09:15 AM",
    physicalDescription: "Wearing yellow raincoat, blue jeans, approx 4ft 5in tall.",
    contactName: "Sunita Sharma (Mother)",
    contactPhone: "+91 98920 ***** (Protected)",
    photoUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=400&q=80",
    status: "searching"
  },
  {
    id: "MIS-102",
    name: "Shantaram Bhosale",
    age: 68,
    gender: "Male",
    lastSeenLocation: "Tamhini Ghat bus stop, Pune highway",
    lastSeenDate: "2026-07-23 05:30 PM",
    physicalDescription: "Grey hair, white kurta pyjama, wears black rimmed glasses.",
    contactName: "Prakash Bhosale (Son)",
    contactPhone: "+91 97300 ***** (Protected)",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    status: "searching"
  },
  {
    id: "MIS-103",
    name: "Priya Deshmukh",
    age: 26,
    gender: "Female",
    lastSeenLocation: "Thane Industrial Zone near Warehouse #4",
    lastSeenDate: "2026-07-24 08:00 AM",
    physicalDescription: "Red salwar suit, height 5ft 3in, carried green backpack.",
    contactName: "Anil Deshmukh (Brother)",
    contactPhone: "+91 98211 ***** (Protected)",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    status: "found"
  }
];

// Seed transparent donations & expenditure ledger
const INITIAL_DONATION_LEDGER = {
  totalRaised: 1250000, // ₹ 12.5 Lakhs
  totalAllocated: 890000,
  remaining: 360000,
  items: [
    {
      id: "EXP-801",
      incidentId: "REP-2026-001",
      incidentTitle: "Kurla West Flood Relief",
      item: "500 Drinking Water Cans (20L) & High Energy Bar Kits",
      cost: 145000,
      vendor: "Bisleri & Akshaya Patra Foundation",
      invoiceRef: "INV-2026-7789",
      date: "2026-07-24"
    },
    {
      id: "EXP-802",
      incidentId: "REP-2026-002",
      incidentTitle: "Tamhini Landslide Clearing",
      item: "JCB Excavator Fuel & Emergency Medical Kits Dispatch",
      cost: 220000,
      vendor: "District Disaster Management Cell",
      invoiceRef: "INV-2026-4421",
      date: "2026-07-24"
    },
    {
      id: "EXP-803",
      incidentId: "REP-2026-001",
      incidentTitle: "Kurla Shelter Setup",
      item: "200 Waterproof Tents & Inflatable Sleeping Mats",
      cost: 525000,
      vendor: "Red Cross India Logistics",
      invoiceRef: "INV-2026-9012",
      date: "2026-07-23"
    }
  ]
};

// Seed volunteers
const INITIAL_VOLUNTEERS = [
  {
    id: "VOL-01",
    name: "Dr. Ananya Roy",
    phone: "+91 98765 43210",
    skills: ["First Aid & Medical", "Logistics & Transport"],
    radius: 15,
    city: "Mumbai",
    status: "available"
  },
  {
    id: "VOL-02",
    name: "Siddharth Naik",
    phone: "+91 98220 11988",
    skills: ["Search & Rescue", "Telecom & IT Support"],
    radius: 25,
    city: "Thane",
    status: "assigned"
  }
];

class StoreManager {
  constructor() {
    this.listeners = new Set();
    this.state = {
      reports: [],
      shelters: [],
      rescueUnits: [],
      missingPersons: [],
      donationLedger: {
        totalRaised: 1250000,
        totalAllocated: 890000,
        remaining: 360000,
        items: []
      },
      volunteers: [],
      emergencyAlerts: [],
      users: []
    };

    this.initFirestoreListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  initFirestoreListeners() {
    // 1. Reports Listener
    onSnapshot(collection(db, 'reports'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_REPORTS.forEach(async (report) => {
          await setDoc(doc(db, 'reports', report.id), report);
        });
      } else {
        const reports = [];
        snapshot.forEach(doc => reports.push(doc.data()));
        reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.state = { ...this.state, reports };
        this.notify();
      }
    });

    // 2. Shelters Listener
    onSnapshot(collection(db, 'shelters'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_SHELTERS.forEach(async (shelter) => {
          await setDoc(doc(db, 'shelters', shelter.id), shelter);
        });
      } else {
        const shelters = [];
        snapshot.forEach(doc => shelters.push(doc.data()));
        this.state = { ...this.state, shelters };
        this.notify();
      }
    });

    // 3. Rescue Units Listener
    onSnapshot(collection(db, 'rescueUnits'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_RESCUE_UNITS.forEach(async (unit) => {
          await setDoc(doc(db, 'rescueUnits', unit.id), unit);
        });
      } else {
        const rescueUnits = [];
        snapshot.forEach(doc => rescueUnits.push(doc.data()));
        this.state = { ...this.state, rescueUnits };
        this.notify();
      }
    });

    // 4. Missing Persons Listener
    onSnapshot(collection(db, 'missingPersons'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_MISSING_PERSONS.forEach(async (person) => {
          await setDoc(doc(db, 'missingPersons', person.id), person);
        });
      } else {
        const missingPersons = [];
        snapshot.forEach(doc => missingPersons.push(doc.data()));
        this.state = { ...this.state, missingPersons };
        this.notify();
      }
    });

    // 5. Volunteers Listener
    onSnapshot(collection(db, 'volunteers'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_VOLUNTEERS.forEach(async (vol) => {
          await setDoc(doc(db, 'volunteers', vol.id), vol);
        });
      } else {
        const volunteers = [];
        snapshot.forEach(doc => volunteers.push(doc.data()));
        this.state = { ...this.state, volunteers };
        this.notify();
      }
    });

    // 6. Emergency Alerts Listener
    onSnapshot(collection(db, 'emergencyAlerts'), (snapshot) => {
      if (snapshot.empty) {
        const initialAlerts = [
          {
            id: "ALT-001",
            severity: "warning",
            title: "Red Storm Alert - Konkan & Mumbai Metropolitan Region",
            source: "Open-Meteo Severe Forecast & IMD Sync",
            message: "Heavy to extremely heavy rainfall (150mm+) forecasted over next 12 hours. High tide at 14:30. Avoid flooded underpasses.",
            timestamp: new Date().toISOString()
          }
        ];
        initialAlerts.forEach(async (alert) => {
          await setDoc(doc(db, 'emergencyAlerts', alert.id), alert);
        });
      } else {
        const emergencyAlerts = [];
        snapshot.forEach(doc => emergencyAlerts.push(doc.data()));
        emergencyAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.state = { ...this.state, emergencyAlerts };
        this.notify();
      }
    });

    // 7. Donations Listener
    onSnapshot(collection(db, 'donations'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_DONATION_LEDGER.items.forEach(async (item) => {
          await setDoc(doc(db, 'donations', item.id), item);
        });
      } else {
        const items = [];
        snapshot.forEach(doc => items.push(doc.data()));
        items.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

        const totalAllocated = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
        const remaining = 360000;
        const totalRaised = totalAllocated + remaining;

        this.state = {
          ...this.state,
          donationLedger: {
            totalRaised,
            totalAllocated,
            remaining,
            items
          }
        };
        this.notify();
      }
    });

    // 8. Users Listener
    onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = [];
      snapshot.forEach(doc => users.push(doc.data()));
      this.state = { ...this.state, users };
      this.notify();
    });
  }

  // Action Methods
  async addReport(newReport) {
    const id = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const reportObj = {
      id,
      timestamp: new Date().toISOString(),
      status: "unverified",
      flags: 0,
      autoHidden: false,
      ...newReport
    };
    await setDoc(doc(db, 'reports', id), reportObj);
    return reportObj;
  }

  async flagReport(reportId) {
    const docRef = doc(db, 'reports', reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentFlags = docSnap.data().flags || 0;
      const newFlags = currentFlags + 1;
      await updateDoc(docRef, {
        flags: newFlags,
        autoHidden: newFlags >= 2
      });
    }
  }

  async registerVolunteer(volunteerData, uid = null) {
    const id = uid || `VOL-${Math.floor(10 + Math.random() * 90)}`;
    const volObj = {
      id,
      status: "available",
      ...volunteerData
    };
    await setDoc(doc(db, 'volunteers', id), volObj);
    return volObj;
  }

  async addDonation(amount, incidentTitle = "General Emergency Fund", user = null) {
    const numAmount = Number(amount);
    const id = `EXP-${Math.floor(850 + Math.random() * 100)}`;
    const donationObj = {
      id,
      userId: user?.uid || 'anonymous',
      userEmail: user?.email || 'anonymous',
      incidentId: "REP-2026-001",
      incidentTitle: incidentTitle,
      item: `Fund Allocation: Ready-to-Eat Emergency Meals & Clean Water Packs`,
      cost: numAmount,
      vendor: "Verified Local Relief Supplies Vendor",
      invoiceRef: `RZP-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0]
    };
    await setDoc(doc(db, 'donations', id), donationObj);
  }

  async addMissingPerson(missingData) {
    const id = `MIS-${Math.floor(110 + Math.random() * 900)}`;
    const record = {
      id,
      status: "searching",
      ...missingData
    };
    await setDoc(doc(db, 'missingPersons', id), record);
    return record;
  }

  async updateMissingStatus(id, newStatus) {
    await updateDoc(doc(db, 'missingPersons', id), {
      status: newStatus
    });
  }

  async addEmergencyAlert(alertObj) {
    const id = `ALT-${Math.floor(100 + Math.random() * 900)}`;
    const alertRecord = {
      id,
      timestamp: new Date().toISOString(),
      ...alertObj
    };
    await setDoc(doc(db, 'emergencyAlerts', id), alertRecord);
  }

  async approveReport(reportId) {
    await updateDoc(doc(db, 'reports', reportId), {
      flags: 0,
      autoHidden: false,
      status: 'verified'
    });
  }

  async dismissReport(reportId) {
    await deleteDoc(doc(db, 'reports', reportId));
  }

  async updateUserRole(uid, newRole) {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role: newRole });
  }
}

export const store = new StoreManager();

export function useStore() {
  const [state, setState] = useState(store.state);

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, []);

  return state;
}
