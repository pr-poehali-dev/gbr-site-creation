import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Zone {
  id: number;
  name: string;
  address: string;
  isGuarded: boolean;
  batteryLevel: number;
  customStatus?: CustomStatus | null;
  contractStatus: 'active' | 'suspended' | 'terminated';
  history: HistoryEntry[];
}

interface CustomStatus {
  id: string;
  name: string;
  color: string;
}

interface Employee {
  id: string;
  name: string;
  rank: string;
  status: 'available' | 'on_call';
}

interface Call {
  id: string;
  zoneId: number;
  type: 'emergency' | 'alarm';
  timestamp: Date;
  status: 'pending' | 'assigned' | 'completed';
  assignedEmployee?: string;
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
}

type Tab = 'main' | 'zones' | 'monitoring' | 'alarm' | 'reports' | 'settings' | 'employees' | 'calls';

const RANKS = ['Рядовой', 'Ефрейтор', 'Сержант', 'Старший сержант', 'Прапорщик', 'Лейтенант', 'Капитан', 'Майор', 'Полковник', 'Генерал'];

function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('main');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  
  // Form states
  const [newZoneAddress, setNewZoneAddress] = useState('');
  const [newZonePhone, setNewZonePhone] = useState('');
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3b82f6');
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRank, setNewEmployeeRank] = useState('Рядовой');

  // Initialize 425 zones
  useEffect(() => {
    const initialZones: Zone[] = [];
    for (let i = 1; i <= 425; i++) {
      initialZones.push({
        id: i,
        name: `Участок ${i}`,
        address: `ул. Охранная, ${i}`,
        isGuarded: Math.random() > 0.32,
        batteryLevel: Math.floor(Math.random() * 100) + 1,
        customStatus: null,
        contractStatus: 'active',
        history: [{
          id: `h${i}`,
          timestamp: new Date(),
          action: 'Создание участка',
          details: 'Участок добавлен в систему'
        }]
      });
    }
    setZones(initialZones);
  }, []);

  // Initialize employees
  useEffect(() => {
    const initialEmployees: Employee[] = [
      { id: '1', name: 'Иванов Иван Иванович', rank: 'Капитан', status: 'available' },
      { id: '2', name: 'Петров Петр Петрович', rank: 'Лейтенант', status: 'available' },
      { id: '3', name: 'Сидоров Сидор Сидорович', rank: 'Сержант', status: 'available' },
      { id: '4', name: 'Козлов Андрей Михайлович', rank: 'Майор', status: 'available' },
      { id: '5', name: 'Морозов Алексей Викторович', rank: 'Старший сержант', status: 'available' },
    ];
    setEmployees(initialEmployees);
  }, []);

  // Auto alarm trigger every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const activeZones = zones.filter(z => z.isGuarded && z.contractStatus === 'active');
      if (activeZones.length > 0) {
        const randomZone = activeZones[Math.floor(Math.random() * activeZones.length)];
        triggerAlarm(randomZone.id);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [zones]);

  // Battery discharge simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev => prev.map(zone => ({
        ...zone,
        batteryLevel: Math.max(0, zone.batteryLevel - 5)
      })));
    }, 30000); // Every 30 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const addHistoryEntry = (zoneId: number, action: string, details: string) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? {
            ...zone,
            history: [{
              id: `${Date.now()}`,
              timestamp: new Date(),
              action,
              details
            }, ...zone.history]
          }
        : zone
    ));
  };

  const toggleGuard = (zoneId: number, guard: boolean) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, isGuarded: guard } : zone
    ));
    addHistoryEntry(zoneId, guard ? 'Поставлен на охрану' : 'Снят с охраны', `${new Date().toLocaleString()}`);
  };

  const triggerEmergency = (zoneId: number) => {
    const newCall: Call = {
      id: `${Date.now()}`,
      zoneId,
      type: 'emergency',
      timestamp: new Date(),
      status: 'pending'
    };
    setCalls(prev => [newCall, ...prev]);
    addHistoryEntry(zoneId, 'Экстренный вызов ГБР', `${new Date().toLocaleString()}`);
  };

  const triggerAlarm = (zoneId: number) => {
    const newCall: Call = {
      id: `${Date.now()}`,
      zoneId,
      type: 'alarm',
      timestamp: new Date(),
      status: 'pending'
    };
    setCalls(prev => [newCall, ...prev]);
    addHistoryEntry(zoneId, 'Сработала сигнализация', `${new Date().toLocaleString()}`);
  };

  const assignEmployee = (callId: string, employeeId: string) => {
    setCalls(prev => prev.map(call => 
      call.id === callId ? { ...call, status: 'assigned' as const, assignedEmployee: employeeId } : call
    ));
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, status: 'on_call' as const } : emp
    ));
  };

  const completeCall = (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (call?.assignedEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === call.assignedEmployee ? { ...emp, status: 'available' as const } : emp
      ));
    }
    setCalls(prev => prev.filter(c => c.id !== callId));
  };

  const setBatteryLevel = (zoneId: number, level: number) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, batteryLevel: level } : zone
    ));
    addHistoryEntry(zoneId, `Батарея ${level === 100 ? 'заряжена' : 'разряжена'}`, `Уровень: ${level}%`);
  };

  const setCustomStatus = (zoneId: number, status: CustomStatus | null) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, customStatus: status } : zone
    ));
  };

  const setContractStatus = (zoneId: number, status: 'active' | 'suspended' | 'terminated') => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId ? { ...zone, contractStatus: status } : zone
    ));
    const statusText = status === 'terminated' ? 'Договор расторгнут' : 
                     status === 'suspended' ? 'Тариф приостановлен' : 'Договор возобновлен';
    addHistoryEntry(zoneId, statusText, `${new Date().toLocaleString()}`);
  };

  const addNewZone = () => {
    if (!newZoneAddress || !newZonePhone) return;
    
    const newId = Math.max(...zones.map(z => z.id)) + 1;
    const newZone: Zone = {
      id: newId,
      name: `Участок ${newId}`,
      address: newZoneAddress,
      isGuarded: false,
      batteryLevel: 100,
      customStatus: null,
      contractStatus: 'active',
      history: [{
        id: `h${newId}`,
        timestamp: new Date(),
        action: 'Создание участка',
        details: `Адрес: ${newZoneAddress}, Телефон: ${newZonePhone}`
      }]
    };
    
    setZones(prev => [...prev, newZone]);
    setNewZoneAddress('');
    setNewZonePhone('');
  };

  const addCustomStatus = () => {
    if (!newStatusName) return;
    
    const newStatus: CustomStatus = {
      id: `${Date.now()}`,
      name: newStatusName,
      color: newStatusColor
    };
    
    setCustomStatuses(prev => [...prev, newStatus]);
    setNewStatusName('');
    setNewStatusColor('#3b82f6');
  };

  const addEmployee = () => {
    if (!newEmployeeName) return;
    
    const newEmployee: Employee = {
      id: `${Date.now()}`,
      name: newEmployeeName,
      rank: newEmployeeRank,
      status: 'available'
    };
    
    setEmployees(prev => [...prev, newEmployee]);
    setNewEmployeeName('');
    setNewEmployeeRank('Рядовой');
  };

  const removeEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const getStatusColor = (zone: Zone): string => {
    if (zone.contractStatus === 'terminated') return '#ef4444';
    if (zone.contractStatus === 'suspended') return '#f97316';
    if (zone.batteryLevel <= 20) return '#f97316';
    if (zone.customStatus) return zone.customStatus.color;
    return zone.isGuarded ? '#22c55e' : '#3b82f6';
  };

  const getStatusText = (zone: Zone): string => {
    if (zone.contractStatus === 'terminated') return 'Договор расторгнут';
    if (zone.contractStatus === 'suspended') return 'Тариф приостановлен';
    if (zone.batteryLevel <= 20) return 'Разряжено';
    if (zone.batteryLevel === 100) return 'Батарея заряжена';
    if (zone.customStatus) return zone.customStatus.name;
    return zone.isGuarded ? 'Под охраной' : 'Не охраняется';
  };

  // Stats calculations
  const totalZones = zones.length;
  const guardedZones = zones.filter(z => z.isGuarded && z.contractStatus === 'active').length;
  const emergencyCalls = calls.filter(c => c.type === 'emergency').length;
  const customStatusCount = zones.filter(z => z.customStatus).length;
  const notGuardedZones = zones.filter(z => !z.isGuarded || z.contractStatus !== 'active').length;

  // Sort zones: emergency calls first, then low battery, then by status
  const sortedZones = [...zones].sort((a, b) => {
    const aHasEmergencyCall = calls.some(c => c.zoneId === a.id && c.type === 'emergency' && c.status === 'pending');
    const bHasEmergencyCall = calls.some(c => c.zoneId === b.id && c.type === 'emergency' && c.status === 'pending');
    
    if (aHasEmergencyCall && !bHasEmergencyCall) return -1;
    if (!aHasEmergencyCall && bHasEmergencyCall) return 1;
    
    if (a.batteryLevel <= 20 && b.batteryLevel > 20) return -1;
    if (a.batteryLevel > 20 && b.batteryLevel <= 20) return 1;
    
    return a.id - b.id;
  });

  const pendingCalls = calls.filter(c => c.status === 'pending');
  const processedCalls = calls.filter(c => c.status === 'assigned').length;
  const averageResponseTime = 0; // Placeholder for demo

  const tabs = [
    { id: 'main', label: 'Главная' },
    { id: 'zones', label: 'Участки' },
    { id: 'monitoring', label: 'Мониторинг' },
    { id: 'alarm', label: 'Сигнализация' },
    { id: 'reports', label: 'Отчеты' },
    { id: 'employees', label: 'Сотрудники' },
    { id: 'calls', label: 'Вызовы' },
    { id: 'settings', label: 'Настройки' }
  ];

  const themeClass = isDarkTheme ? 'dark bg-gray-900 text-white' : 'bg-gray-50';

  return (
    <div className={`min-h-screen ${themeClass}`}>
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={24} />
            <h1 className="text-xl font-bold">Система ГБР</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="text-white border-white hover:bg-slate-700"
            >
              <Icon name={isDarkTheme ? "Sun" : "Moon"} size={16} />
            </Button>
            <span className="text-sm">24.07.2025, 00:14:21</span>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Всего участков</div>
              <div className="text-2xl font-bold">{totalZones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Под охраной</div>
              <div className="text-2xl font-bold text-green-600">{guardedZones}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Экстренные вызовы</div>
              <div className="text-2xl font-bold text-red-600">{emergencyCalls}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Кастомные статусы</div>
              <div className="text-2xl font-bold text-purple-600">{customStatusCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">Не охраняется</div>
              <div className="text-2xl font-bold text-blue-600">{notGuardedZones}</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as Tab)}
              className="rounded-none"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Main Tab */}
        {activeTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Общая информация</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Система управления охранными участками ГБР обеспечивает круглосуточный 
                  контроль и безопасность {totalZones} объектов.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Уровень защиты:</span>
                    <span className="font-medium">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zones Tab */}
        {activeTab === 'zones' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Список участков</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {sortedZones.map(zone => {
                    const hasEmergencyCall = calls.some(c => c.zoneId === zone.id && c.type === 'emergency' && c.status === 'pending');
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all hover:shadow-md bg-white ${
                          selectedZone?.id === zone.id ? 'ring-2 ring-blue-500' : ''
                        } ${hasEmergencyCall ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.address}</div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              style={{ 
                                backgroundColor: hasEmergencyCall ? '#ef4444' : getStatusColor(zone), 
                                color: 'white' 
                              }}
                            >
                              {hasEmergencyCall ? 'ВЫЕЗД ГБР' : getStatusText(zone)}
                            </Badge>
                            <div className="text-xs text-gray-400 mt-1">
                              Батарея: {zone.batteryLevel}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {selectedZone && (
              <Card>
                <CardHeader>
                  <CardTitle>Управление участком {selectedZone.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Адрес: {selectedZone.address}</p>
                    <p className="text-sm text-gray-600 mb-4">Батарея: {selectedZone.batteryLevel}%</p>
                  </div>

                  {/* Guard Controls */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      variant={selectedZone.isGuarded ? "outline" : "default"}
                      onClick={() => toggleGuard(selectedZone.id, !selectedZone.isGuarded)}
                    >
                      <Icon name={selectedZone.isGuarded ? "ShieldOff" : "Shield"} size={16} className="mr-2" />
                      {selectedZone.isGuarded ? 'Снять с охраны' : 'Поставить на охрану'}
                    </Button>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700"
                      onClick={() => triggerEmergency(selectedZone.id)}
                    >
                      <Icon name="AlertTriangle" size={16} className="mr-2" />
                      Экстренный вызов ГБР
                    </Button>
                  </div>

                  {/* Battery Controls */}
                  <div className="space-y-2">
                    <Label>Управление батареей:</Label>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBatteryLevel(selectedZone.id, Math.max(0, selectedZone.batteryLevel - 20))}
                      >
                        Разрядить
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBatteryLevel(selectedZone.id, 100)}
                      >
                        Зарядить
                      </Button>
                    </div>
                  </div>

                  {/* Custom Status */}
                  <div className="space-y-2">
                    <Label>Кастомный статус:</Label>
                    <Select 
                      key={customStatuses.length}
                      value={selectedZone.customStatus?.id || ''} 
                      onValueChange={(value) => {
                        const status = customStatuses.find(s => s.id === value);
                        setCustomStatus(selectedZone.id, status || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Сбросить</SelectItem>
                        {customStatuses.map(status => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                              {status.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Clock" size={20} />
                  Время реагирования ГБР
                </CardTitle>
                <p className="text-sm text-gray-600">Статистика экстренных вызовов</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{processedCalls}</div>
                    <div className="text-sm text-gray-600">Обработано</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{pendingCalls.length}</div>
                    <div className="text-sm text-gray-600">Активных</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{averageResponseTime}</div>
                    <div className="text-sm text-gray-600">Ср. время (мин)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Activity" size={20} />
                  История вызовов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {calls.slice(0, 10).map(call => {
                    const zone = zones.find(z => z.id === call.zoneId);
                    return (
                      <div key={call.id} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{zone?.name}</span>
                          <Badge variant={call.type === 'emergency' ? 'destructive' : 'secondary'}>
                            {call.type === 'emergency' ? 'Экстренный' : 'Сигнализация'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {call.timestamp.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alarm Tab */}
        {activeTab === 'alarm' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Массовое управление участками</CardTitle>
                <p className="text-sm text-gray-600">Выберите участки для группового управления ({selectedZones.length} выбрано)</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      selectedZones.forEach(zoneId => toggleGuard(zoneId, true));
                      setSelectedZones([]);
                    }}
                    disabled={selectedZones.length === 0}
                  >
                    <Icon name="Shield" size={16} className="mr-2" />
                    Поставить на охрану ({selectedZones.length})
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      selectedZones.forEach(zoneId => toggleGuard(zoneId, false));
                      setSelectedZones([]);
                    }}
                    disabled={selectedZones.length === 0}
                  >
                    <Icon name="ShieldOff" size={16} className="mr-2" />
                    Снять с охраны ({selectedZones.length})
                  </Button>
                  
                  <Button 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => {
                      selectedZones.forEach(zoneId => triggerAlarm(zoneId));
                      setSelectedZones([]);
                    }}
                    disabled={selectedZones.length === 0}
                  >
                    <Icon name="Siren" size={16} className="mr-2" />
                    ВЫЕЗД ГБР ({selectedZones.length})
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedZones(zones.filter(z => z.isGuarded).map(z => z.id))}
                  >
                    Выбрать все активные
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedZones([])}
                  >
                    Очистить
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список участков</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {sortedZones.slice(0, 50).map(zone => {
                    const isSelected = selectedZones.includes(zone.id);
                    const hasCall = calls.some(c => c.zoneId === zone.id && c.status === 'pending');
                    
                    return (
                      <div
                        key={zone.id}
                        className={`p-3 rounded-lg border transition-all ${
                          hasCall ? 'bg-red-50 border-red-200' : 
                          zone.batteryLevel <= 20 ? 'bg-yellow-50 border-yellow-200' :
                          zone.isGuarded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedZones(prev => [...prev, zone.id]);
                              } else {
                                setSelectedZones(prev => prev.filter(id => id !== zone.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.address}</div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              style={{ 
                                backgroundColor: hasCall ? '#ef4444' : getStatusColor(zone), 
                                color: 'white' 
                              }}
                            >
                              {hasCall ? 'ВЫЕЗД ГБР' : getStatusText(zone)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>История участков</CardTitle>
                <p className="text-sm text-gray-600">Выберите участок для просмотра истории</p>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {sortedZones.slice(0, 20).map(zone => {
                    const hasHistory = zone.history.length > 1;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedZone?.id === zone.id ? 'bg-blue-50 border-blue-200' : 
                          zone.batteryLevel <= 20 ? 'bg-yellow-50 border-yellow-200' :
                          zone.isGuarded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.address}</div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              style={{ 
                                backgroundColor: getStatusColor(zone), 
                                color: 'white' 
                              }}
                            >
                              {getStatusText(zone)}
                            </Badge>
                            {hasHistory && (
                              <div className="text-xs text-blue-600 mt-1">
                                История: {zone.history.length} записей
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Выберите участок</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedZone ? (
                  <div>
                    <h3 className="font-medium mb-4">История участка {selectedZone.name}</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedZone.history.map(entry => (
                        <div key={entry.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{entry.action}</span>
                            <span className="text-xs text-gray-500">
                              {entry.timestamp.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{entry.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Выберите участок из списка слева для просмотра истории
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Список сотрудников</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {employees.map(employee => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-600">{employee.rank}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={employee.status === 'available' ? 'default' : 'secondary'}>
                          {employee.status === 'available' ? 'Доступен' : 'На вызове'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeEmployee(employee.id)}
                        >
                          <Icon name="UserMinus" size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Добавить сотрудника</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>ФИО сотрудника</Label>
                      <Input
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                        placeholder="Иванов Иван Иванович"
                      />
                    </div>
                    <div>
                      <Label>Звание</Label>
                      <Select value={newEmployeeRank} onValueChange={setNewEmployeeRank}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RANKS.map(rank => (
                            <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addEmployee} disabled={!newEmployeeName}>
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Создать сотрудника
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calls Tab */}
        {activeTab === 'calls' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Активные вызовы</CardTitle>
                <p className="text-sm text-gray-600">Вызовы, ожидающие назначения сотрудника</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingCalls.map(call => {
                    const zone = zones.find(z => z.id === call.zoneId);
                    if (!zone) return null;
                    
                    return (
                      <div key={call.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-600">{zone.address}</div>
                          </div>
                          <Badge variant={call.type === 'emergency' ? 'destructive' : 'secondary'}>
                            {call.type === 'emergency' ? 'Экстренный вызов' : 'Сигнализация'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {call.timestamp.toLocaleString()}
                        </div>
                        
                        <div className="flex gap-2">
                          <Select 
                            onValueChange={(employeeId) => assignEmployee(call.id, employeeId)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Назначить сотрудника" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.filter(emp => emp.status === 'available').map(employee => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name} ({employee.rank})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                  
                  {pendingCalls.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Нет активных вызовов</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Назначенные вызовы</CardTitle>
                <p className="text-sm text-gray-600">Сотрудники выехали на вызовы</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calls.filter(c => c.status === 'assigned').map(call => {
                    const zone = zones.find(z => z.id === call.zoneId);
                    const employee = employees.find(e => e.id === call.assignedEmployee);
                    if (!zone || !employee) return null;
                    
                    return (
                      <div key={call.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-600">{zone.address}</div>
                          </div>
                          <Badge variant="secondary">В работе</Badge>
                        </div>
                        <div className="text-sm text-blue-600 mb-2">
                          Сотрудник выехал: {employee.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {call.timestamp.toLocaleString()}
                        </div>
                        
                        <Button 
                          size="sm" 
                          onClick={() => completeCall(call.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Завершить вызов
                        </Button>
                      </div>
                    );
                  })}
                  
                  {calls.filter(c => c.status === 'assigned').length === 0 && (
                    <p className="text-gray-500 text-center py-8">Нет назначенных вызовов</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление участками</CardTitle>
                <p className="text-sm text-gray-600">Создание, изменение и управление договорами</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Zone */}
                <div>
                  <h3 className="font-medium mb-3">Добавить новый участок</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Адрес</Label>
                      <Input
                        value={newZoneAddress}
                        onChange={(e) => setNewZoneAddress(e.target.value)}
                        placeholder="Введите адрес"
                      />
                    </div>
                    <div>
                      <Label>Номер телефона</Label>
                      <Input
                        value={newZonePhone}
                        onChange={(e) => setNewZonePhone(e.target.value)}
                        placeholder="+7XXXXXXXXXX"
                      />
                    </div>
                    <Button 
                      onClick={addNewZone} 
                      disabled={!newZoneAddress || !newZonePhone}
                      className="w-full"
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Создать участок
                    </Button>
                  </div>
                </div>

                {/* Custom Status */}
                <div>
                  <h3 className="font-medium mb-3">Создать кастомный статус</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Название статуса</Label>
                      <Input
                        value={newStatusName}
                        onChange={(e) => setNewStatusName(e.target.value)}
                        placeholder="Например: Ремонт"
                      />
                    </div>
                    <div>
                      <Label>Цвет</Label>
                      <Input
                        type="color"
                        value={newStatusColor}
                        onChange={(e) => setNewStatusColor(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={addCustomStatus} 
                      disabled={!newStatusName}
                      className="w-full"
                    >
                      <Icon name="Palette" size={16} className="mr-2" />
                      Создать статус
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Управление договорами</CardTitle>
                <p className="text-sm text-gray-600">Выберите участок во вкладке "Участки" для управления договором</p>
              </CardHeader>
              <CardContent>
                {selectedZone ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">Быстрый поиск участка</h3>
                    <Select 
                      value={selectedZone.id.toString()} 
                      onValueChange={(value) => {
                        const zone = zones.find(z => z.id === parseInt(value));
                        if (zone) setSelectedZone(zone);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите участок" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.slice(0, 100).map(zone => (
                          <SelectItem key={zone.id} value={zone.id.toString()}>
                            {zone.name} - {zone.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Участок: {selectedZone.name}</h4>
                      <p className="text-sm text-gray-600">{selectedZone.address}</p>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="destructive"
                          className="w-full"
                          onClick={() => setContractStatus(selectedZone.id, 'terminated')}
                          disabled={selectedZone.contractStatus === 'terminated'}
                        >
                          <Icon name="XCircle" size={16} className="mr-2" />
                          Расторгнуть договор
                        </Button>
                        
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => setContractStatus(selectedZone.id, 'suspended')}
                          disabled={selectedZone.contractStatus === 'terminated' || selectedZone.contractStatus === 'suspended'}
                        >
                          <Icon name="Pause" size={16} className="mr-2" />
                          Временно приостановить тариф
                        </Button>
                        
                        <Button 
                          className="w-full"
                          onClick={() => setContractStatus(selectedZone.id, 'active')}
                          disabled={selectedZone.contractStatus === 'active'}
                        >
                          <Icon name="Play" size={16} className="mr-2" />
                          Возобновить договор
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Выберите участок во вкладке "Участки" для управления договором
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;