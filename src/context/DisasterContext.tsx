// DisasterContext.tsx - Context for managing disaster data across the app
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Resource {
  id: number;
  name: string;
  quantity: number;
  category?: string;
  stock?: number; // Keep for backward compatibility
}

export interface Volunteer {
  id: number;
  name: string;
  skill: string;
  available: boolean;
  phone?: string; // E.164 format like +15551234567
  assignedDisasterId?: string;
  assignedLocation?: string;
  notifications?: Array<{ id: string; message: string; createdAt: string }>;
}

export interface Disaster {
  id: string;
  type: string;
  name: string;
  resources: Resource[];
  createdAt: string;
  isActive: boolean;
}

interface DisasterContextType {
  // Disaster management
  disasters: Disaster[];
  activeDisaster: Disaster | null;
  addDisaster: (disaster: Omit<Disaster, 'id' | 'createdAt'>) => void;
  updateDisaster: (id: string, updates: Partial<Disaster>) => void;
  setActiveDisaster: (id: string) => void;
  getDisasterById: (id: string) => Disaster | undefined;
  deleteDisaster: (id: string) => void;
  updateDisasterResources: (disasterId: string, resources: Resource[]) => void;
  
  // Global app state
  selectedDisaster: string;
  setSelectedDisaster: (disaster: string) => void;
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
  volunteers: Volunteer[];
  setVolunteers: (volunteers: Volunteer[]) => void;
  // Volunteer assignment & notifications
  assignVolunteer: (id: number, assignment: { disasterId: string; location: string }) => void;
  notifyVolunteer: (id: number, message: string) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

const STORAGE_KEY = 'disaster-relief-data';

// Default resources for each disaster type
export const defaultResourcesByType: { [key: string]: string[] } = {
  Flood: ["Food", "Water", "Shelter", "Boats"],
  Earthquake: ["Food", "Medicine", "Rescue Tools", "Shelter"],
  Epidemic: ["Medicine", "PPE", "Sanitizers", "Isolation Tents"],
  Wildfire: ["Food", "Water", "Medical Kits", "Blankets"],
  Tsunami: ["Food", "Water", "Life Jackets", "Rescue Boats"],
};

export const disasterTypes: string[] = Object.keys(defaultResourcesByType);

// Default volunteers helper removed; start with empty and let users add

export const DisasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [activeDisaster, setActiveDisasterState] = useState<Disaster | null>(null);
  
  // Global app state
  const [selectedDisaster, setSelectedDisaster] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // Load data from localStorage on init
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const parsedDisasters: Disaster[] = parsed.disasters || [];
        setDisasters(parsedDisasters);
        setSelectedDisaster(parsed.selectedDisaster || '');
        setResources(parsed.resources || []);
        setVolunteers(parsed.volunteers || []);
        
        if (parsed.activeDisasterId) {
          const active = parsedDisasters.find((d: Disaster) => d.id === parsed.activeDisasterId) || null;
          setActiveDisasterState(active);
        }
        // If we have disasters but no active is stored, default to the first one
        if ((!parsed.activeDisasterId || !parsedDisasters.find((d: Disaster) => d.id === parsed.activeDisasterId)) && parsedDisasters.length > 0) {
          setActiveDisasterState(parsedDisasters[0]);
          if (!parsed.selectedDisaster) {
            setSelectedDisaster(parsedDisasters[0].name || parsedDisasters[0].type);
          }
        }

        // Seed a default disaster if none exist in storage
        if (!parsedDisasters || parsedDisasters.length === 0) {
          const now = new Date().toISOString();
          const type = 'Flood';
          const defaultResourceNames = defaultResourcesByType[type] || [];
          const seeded: Disaster = {
            id: Date.now().toString(),
            type,
            name: 'Initial Flood Response',
            resources: defaultResourceNames.map((name, index) => ({ id: index + 1, name, quantity: 10, stock: 10, category: type })),
            createdAt: now,
            isActive: true,
          };
          setDisasters([seeded]);
          setActiveDisasterState(seeded);
          setSelectedDisaster(seeded.name);
        }
      } catch (error) {
        console.error('Error loading disaster data:', error);
        setVolunteers([]);
        const type = 'Flood';
        const defaultResourceNames = defaultResourcesByType[type] || [];
        const seeded: Disaster = {
          id: Date.now().toString(),
          type,
          name: 'Initial Flood Response',
          resources: defaultResourceNames.map((name, index) => ({ id: index + 1, name, quantity: 10, stock: 10, category: type })),
          createdAt: new Date().toISOString(),
          isActive: true,
        };
        setDisasters([seeded]);
        setActiveDisasterState(seeded);
        setSelectedDisaster(seeded.name);
      }
    } else {
      // First-time users: seed one default disaster so the UI isn't empty
      const type = 'Flood';
      const defaultResourceNames = defaultResourcesByType[type] || [];
      const seeded: Disaster = {
        id: Date.now().toString(),
        type,
        name: 'Initial Flood Response',
        resources: defaultResourceNames.map((name, index) => ({ id: index + 1, name, quantity: 10, stock: 10, category: type })),
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setDisasters([seeded]);
      setActiveDisasterState(seeded);
      setSelectedDisaster(seeded.name);
      setVolunteers([]);
    }
  }, []);

  // Save data to localStorage whenever any state changes
  useEffect(() => {
    const dataToSave = {
      disasters,
      activeDisasterId: activeDisaster?.id || null,
      selectedDisaster,
      resources,
      volunteers,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [disasters, activeDisaster, selectedDisaster, resources, volunteers]);

  const addDisaster = (disasterData: Omit<Disaster, 'id' | 'createdAt'>) => {
    const newDisaster: Disaster = {
      ...disasterData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // Generate default resources if none provided
    if (!newDisaster.resources || newDisaster.resources.length === 0) {
      const defaultResourceNames = defaultResourcesByType[newDisaster.type] || [];
      newDisaster.resources = defaultResourceNames.map((name, index) => ({
        id: index + 1,
        name,
        quantity: 10,
        stock: 10, // Keep for backward compatibility
        category: newDisaster.type,
      }));
    }

    setDisasters(prev => [...prev, newDisaster]);
    
    // Set as active if it's the first disaster or marked as active
    if (disasters.length === 0 || newDisaster.isActive) {
      setActiveDisasterState(newDisaster);
    }
  };

  const updateDisaster = (id: string, updates: Partial<Disaster>) => {
    setDisasters(prev => prev.map(disaster => 
      disaster.id === id ? { ...disaster, ...updates } : disaster
    ));

    // Update active disaster if it's the one being updated
    if (activeDisaster?.id === id) {
      setActiveDisasterState(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const setActiveDisaster = (id: string) => {
    if (!id) return; // guard against empty id
    const disaster = disasters.find(d => d.id === id);
    if (disaster) {
      // Update all disasters to set isActive false, then set the selected one to true
      setDisasters(prev => prev.map(d => ({ ...d, isActive: d.id === id })));
      setActiveDisasterState(disaster);
    }
  };

  const getDisasterById = (id: string): Disaster | undefined => {
    return disasters.find(d => d.id === id);
  };

  const deleteDisaster = (id: string) => {
    setDisasters(prev => prev.filter(d => d.id !== id));
    
    // If the deleted disaster was active, set another one as active
    if (activeDisaster?.id === id) {
      const remaining = disasters.filter(d => d.id !== id);
      setActiveDisasterState(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const updateDisasterResources = (disasterId: string, resources: Resource[]) => {
    updateDisaster(disasterId, { resources });
  };

  const notifyVolunteer: DisasterContextType["notifyVolunteer"] = (id, message) => {
    setVolunteers(prev => prev.map(v => {
      if (v.id !== id) return v;
      const note = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, createdAt: new Date().toISOString() };
      const notifications = Array.isArray(v.notifications) ? [...v.notifications, note] : [note];
      return { ...v, notifications };
    }));
  };

  const assignVolunteer: DisasterContextType["assignVolunteer"] = (id, assignment) => {
    const disaster = disasters.find(d => d.id === assignment.disasterId);
    setVolunteers(prev => prev.map(v => (
      v.id === id
        ? { ...v, assignedDisasterId: assignment.disasterId, assignedLocation: assignment.location }
        : v
    )));
    const summary = disaster ? `${disaster.name} (${disaster.type})` : assignment.disasterId;
    const resList = (disaster?.resources || resources).map(r => `${r.name}: ${r.quantity}`).join(", ");
    notifyVolunteer(id, `Deployment assigned: ${summary} @ ${assignment.location}. Available resources: ${resList || 'None'}.`);
  };

  return (
    <DisasterContext.Provider value={{
      disasters,
      activeDisaster,
      addDisaster,
      updateDisaster,
      setActiveDisaster,
      getDisasterById,
      deleteDisaster,
      updateDisasterResources,
      selectedDisaster,
      setSelectedDisaster,
      resources,
      setResources,
      volunteers,
      setVolunteers,
      assignVolunteer,
      notifyVolunteer,
    }}>
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (context === undefined) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};