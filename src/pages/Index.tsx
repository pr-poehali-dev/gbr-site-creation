import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

// Типы данных
interface CustomStatus {
  id: string;
  name: string;
  color: string;
  bgColor: string;
}

interface SecurityZone {
  id: number;
  name: string;
  address: string;
  status: 'protected' | 'unprotected' | 'emergency' | string;
  customStatus?: CustomStatus;
  lastUpdate: Date;
  battery: number;
  contractStatus: 'active' | 'suspended' | 'terminated';
  phone?: string;
}

interface ZoneHistoryEvent {
  id: string;
  zoneId: number;
  event: 'protection_on' | 'protection_off' | 'emergency_call' | 'battery_change' | 'custom_status' | 'contract_change';
  timestamp: Date;
  details: string;
  oldValue?: string;
  newValue?: string;
}

interface EmergencyCall {
  id: string;
  zoneId: number;
  zoneName: string;
  timestamp: Date;
  responseTime?: number;
  status: 'active' | 'responded' | 'resolved';
}

const Index = () => {
  const [zones, setZones] = useState<SecurityZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<SecurityZone | null>(null);
  const [emergencyCalls, setEmergencyCalls] = useState<number[]>([]);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyCall[]>([]);
  const [selectedZones, setSelectedZones] = useState<number[]>([]);
  const [zoneHistory, setZoneHistory] = useState<ZoneHistoryEvent[]>([]);
  const [customStatuses, setCustomStatuses] = useState<CustomStatus[]>([]);
  const [selectedZoneForReport, setSelectedZoneForReport] = useState<SecurityZone | null>(null);
  
  // Состояния для создания нового участка
  const [newZoneAddress, setNewZoneAddress] = useState('');
  const [newZonePhone, setNewZonePhone] = useState('');
  const [isAddingZone, setIsAddingZone] = useState(false);

  // Состояния для кастомных статусов
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3b82f6');
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  // Инициализация 425 участков (125 + 300)
  useEffect(() => {
    const initialZones: SecurityZone[] = Array.from({ length: 425 }, (_, i) => ({
      id: i + 1,
      name: `Участок ${i + 1}`,
      address: `ул. Охранная, ${i + 1}`,
      status: Math.random() > 0.7 ? 'protected' : 'unprotected',
      lastUpdate: new Date(),
      battery: Math.floor(Math.random() * 100) + 1,
      contractStatus: 'active',
      phone: `+7${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    }));
    setZones(initialZones);

    // Инициализация кастомных статусов
    const initialStatuses: CustomStatus[] = [
      { id: '1', name: 'Ремонт', color: '#f59e0b', bgColor: '#fef3c7' },
      { id: '2', name: 'Тестирование', color: '#8b5cf6', bgColor: '#f3e8ff' },
      { id: '3', name: 'Отпуск', color: '#06b6d4', bgColor: '#cffafe' },
    ];
    setCustomStatuses(initialStatuses);
  }, []);

  // Симуляция срабатывания сигнализации каждые 10 минут
  useEffect(() => {
    const interval = setInterval(() => {
      const activeZones = zones.filter(z => z.contractStatus === 'active');
      if (activeZones.length === 0) return;
      
      const randomZone = activeZones[Math.floor(Math.random() * activeZones.length)];
      const zone = zones.find(z => z.id === randomZone.id);
      
      if (zone) {
        setZones(prev => prev.map(zone => 
          zone.id === randomZone.id 
            ? { ...zone, status: 'emergency', lastUpdate: new Date() }
            : zone
        ));
        setEmergencyCalls(prev => [...prev, randomZone.id]);
        
        // Добавляем в историю участка
        const historyEvent: ZoneHistoryEvent = {
          id: `${randomZone.id}-emergency-${Date.now()}`,
          zoneId: randomZone.id,
          event: 'emergency_call',
          timestamp: new Date(),
          details: 'Автоматическое срабатывание сигнализации'
        };
        setZoneHistory(prev => [historyEvent, ...prev]);
        
        // Добавляем в общую историю вызовов
        const newCall: EmergencyCall = {
          id: `${randomZone.id}-${Date.now()}`,
          zoneId: randomZone.id,
          zoneName: `Участок ${randomZone.id}`,
          timestamp: new Date(),
          status: 'active'
        };
        setEmergencyHistory(prev => [newCall, ...prev]);
      }
    }, 600000); // 10 минут = 600000 мс, для демо используем 60000 (1 минута)

    return () => clearInterval(interval);
  }, [zones]);

  // Функции управления
  const addHistoryEvent = (zoneId: number, event: ZoneHistoryEvent['event'], details: string, oldValue?: string, newValue?: string) => {
    const historyEvent: ZoneHistoryEvent = {
      id: `${zoneId}-${event}-${Date.now()}`,
      zoneId,
      event,
      timestamp: new Date(),
      details,
      oldValue,
      newValue
    };
    setZoneHistory(prev => [historyEvent, ...prev]);
  };

  const setProtection = (zoneId: number, protect: boolean) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { ...zone, status: protect ? 'protected' : 'unprotected', lastUpdate: new Date() }
          : zone
      ));
      
      addHistoryEvent(
        zoneId, 
        protect ? 'protection_on' : 'protection_off',
        protect ? 'Участок поставлен на охрану' : 'Участок снят с охраны',
        zone.status,
        protect ? 'protected' : 'unprotected'
      );
    }
  };

  const setBattery = (zoneId: number, charge: boolean) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      const newBattery = charge ? 100 : Math.max(0, zone.battery - 5); // Разряжается медленнее - на 5%
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { ...zone, battery: newBattery, lastUpdate: new Date() }
          : zone
      ));
      
      addHistoryEvent(
        zoneId,
        'battery_change',
        charge ? 'Батарея заряжена до 100%' : `Батарея разряжена до ${newBattery}%`,
        `${zone.battery}%`,
        `${newBattery}%`
      );
    }
  };

  const setCustomStatus = (zoneId: number, customStatus: CustomStatus | null) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { 
              ...zone, 
              customStatus, 
              status: customStatus ? customStatus.id : 'unprotected',
              lastUpdate: new Date() 
            }
          : zone
      ));
      
      addHistoryEvent(
        zoneId,
        'custom_status',
        customStatus ? `Установлен статус: ${customStatus.name}` : 'Сброшен кастомный статус',
        zone.customStatus?.name || 'Нет',
        customStatus?.name || 'Нет'
      );
    }
  };

  const emergencyCall = (zoneId: number) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { ...zone, status: 'emergency', customStatus: undefined, lastUpdate: new Date() }
          : zone
      ));
      setEmergencyCalls(prev => [zoneId, ...prev]);
      
      addHistoryEvent(zoneId, 'emergency_call', 'Экстренный вызов ГБР');
      
      // Добавляем в историю
      const newCall: EmergencyCall = {
        id: `${zoneId}-${Date.now()}`,
        zoneId: zoneId,
        zoneName: zone.name,
        timestamp: new Date(),
        status: 'active'
      };
      setEmergencyHistory(prev => [newCall, ...prev]);
    }
  };

  const resetEmergency = (zoneId: number) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { ...zone, status: 'unprotected', lastUpdate: new Date() }
        : zone
    ));
    setEmergencyCalls(prev => prev.filter(id => id !== zoneId));
    
    // Обновляем историю
    setEmergencyHistory(prev => prev.map(call => 
      call.zoneId === zoneId && call.status === 'active'
        ? { ...call, status: 'resolved', responseTime: Math.floor(Math.random() * 10) + 1 }
        : call
    ));
    
    addHistoryEvent(zoneId, 'emergency_call', 'Тревога сброшена');
  };

  const setContractStatus = (zoneId: number, status: 'active' | 'suspended' | 'terminated') => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { 
              ...zone, 
              contractStatus: status, 
              lastUpdate: new Date(),
              // При возобновлении договора возвращаем к нормальному режиму
              status: status === 'active' && zone.contractStatus !== 'active' ? 'unprotected' : zone.status,
              customStatus: status === 'active' && zone.contractStatus !== 'active' ? undefined : zone.customStatus
            }
          : zone
      ));
      
      const statusTexts = {
        active: 'Договор активен',
        suspended: 'Тариф приостановлен',
        terminated: 'Договор расторгнут'
      };
      
      addHistoryEvent(
        zoneId,
        'contract_change',
        statusTexts[status],
        zone.contractStatus,
        status
      );
    }
  };

  const addNewZone = () => {
    if (!newZoneAddress.trim() || !newZonePhone.trim()) return;
    
    const newId = Math.max(...zones.map(z => z.id)) + 1;
    const newZone: SecurityZone = {
      id: newId,
      name: `Участок ${newId}`,
      address: newZoneAddress,
      phone: newZonePhone,
      status: 'unprotected',
      lastUpdate: new Date(),
      battery: 100,
      contractStatus: 'active'
    };
    
    setZones(prev => [...prev, newZone]);
    addHistoryEvent(newId, 'contract_change', 'Новый участок добавлен в систему');
    
    setNewZoneAddress('');
    setNewZonePhone('');
    setIsAddingZone(false);
  };

  const addCustomStatus = () => {
    if (!newStatusName.trim()) return;
    
    const newStatus: CustomStatus = {
      id: Date.now().toString(),
      name: newStatusName,
      color: newStatusColor,
      bgColor: newStatusColor + '20'
    };
    
    setCustomStatuses(prev => [...prev, newStatus]);
    setNewStatusName('');
    setNewStatusColor('#3b82f6');
    setIsAddingStatus(false);
  };

  // Массовые операции
  const massProtection = (protect: boolean) => {
    selectedZones.forEach(zoneId => {
      setProtection(zoneId, protect);
    });
    setSelectedZones([]);
  };

  const massEmergencyCall = () => {
    selectedZones.forEach(zoneId => {
      emergencyCall(zoneId);
    });
    setSelectedZones([]);
  };

  const toggleZoneSelection = (zoneId: number) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  // Статистика
  const stats = {
    protected: zones.filter(z => z.status === 'protected').length,
    unprotected: zones.filter(z => z.status === 'unprotected').length,
    emergency: zones.filter(z => z.status === 'emergency').length,
    custom: zones.filter(z => z.customStatus).length,
    total: zones.length
  };

  // Сортировка участков для отображения экстренных вызовов и низкого заряда первыми
  const sortedZones = [...zones].sort((a, b) => {
    if (a.status === 'emergency' && b.status !== 'emergency') return -1;
    if (a.status !== 'emergency' && b.status === 'emergency') return 1;
    if (a.battery <= 20 && b.battery > 20) return -1;
    if (a.battery > 20 && b.battery <= 20) return 1;
    return a.id - b.id;
  });

  const getStatusColor = (zone: SecurityZone) => {
    // Проверяем статусы договора
    if (zone.contractStatus === 'terminated') return '#dc2626';
    if (zone.contractStatus === 'suspended') return '#f59e0b';
    
    // Проверяем низкий заряд батареи
    if (zone.battery <= 20) return '#f59e0b';
    
    if (zone.customStatus) return zone.customStatus.color;
    switch (zone.status) {
      case 'protected': return '#22c55e';
      case 'emergency': return '#dc2626';
      default: return '#3b82f6';
    }
  };

  const getStatusBgColor = (zone: SecurityZone) => {
    // Проверяем статусы договора
    if (zone.contractStatus === 'terminated') return '#fecaca';
    if (zone.contractStatus === 'suspended') return '#fef3c7';
    
    // Проверяем низкий заряд батареи
    if (zone.battery <= 20) return '#fef3c7';
    
    if (zone.customStatus) return zone.customStatus.bgColor;
    switch (zone.status) {
      case 'protected': return '#dcfce7';
      case 'emergency': return '#fecaca';
      default: return '#dbeafe';
    }
  };

  const getStatusText = (zone: SecurityZone) => {
    // Проверяем статусы договора
    if (zone.contractStatus === 'terminated') return 'Договор расторгнут';
    if (zone.contractStatus === 'suspended') return 'Тариф приостановлен';
    
    // Проверяем низкий заряд батареи
    if (zone.battery <= 20) return 'Разряжено';
    
    if (zone.customStatus) return zone.customStatus.name;
    switch (zone.status) {
      case 'protected': return 'Под охраной';
      case 'emergency': return 'ВЫЕЗД ГБР';
      default: return 'Не охраняется';
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'emergency': return 'destructive';
      default: return 'secondary';
    }
  };

  const getContractStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'suspended': return 'Приостановлен';
      case 'terminated': return 'Расторгнут';
      default: return status;
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'suspended': return 'text-yellow-600';
      case 'terminated': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-roboto">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" size={32} className="text-blue-400" />
            <h1 className="text-2xl font-bold">Система ГБР</h1>
          </div>
          <div className="text-sm">
            {new Date().toLocaleString('ru-RU')}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Всего участков</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Под охраной</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.protected}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Экстренные вызовы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.emergency}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Кастомные статусы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.custom}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Не охраняется</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.unprotected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Основные вкладки */}
        <Tabs defaultValue="zones" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="main">Главная</TabsTrigger>
            <TabsTrigger value="zones">Участки</TabsTrigger>
            <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
            <TabsTrigger value="alarms">Сигнализация</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          {/* Главная */}
          <TabsContent value="main" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Общая информация</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Система управления охранными участками ГБР обеспечивает круглосуточный контроль 
                    и безопасность {stats.total} объектов.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Уровень защиты:</span>
                      <span className="font-semibold">{Math.round((stats.protected / stats.total) * 100)}%</span>
                    </div>
                    <Progress value={(stats.protected / stats.total) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {stats.emergency > 0 && (
                <Card className="border-red-500 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center">
                      <Icon name="AlertTriangle" size={20} className="mr-2" />
                      Активные тревоги
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {emergencyCalls.slice(0, 5).map(zoneId => (
                      <Alert key={zoneId} className="mb-2">
                        <AlertDescription>
                          Участок {zoneId} - экстренный вызов
                        </AlertDescription>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Управление участками */}
          <TabsContent value="zones" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Список участков */}
              <Card>
                <CardHeader>
                  <CardTitle>Охранные участки ({zones.length})</CardTitle>
                  <CardDescription>Нажмите на участок для управления</CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {sortedZones.map(zone => (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all hover:shadow-md ${
                          selectedZone?.id === zone.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={selectedZone?.id === zone.id ? {} : { 
                          backgroundColor: getStatusBgColor(zone),
                          borderColor: getStatusColor(zone) + '40'
                        }}
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
                            <div className="text-xs text-gray-400 mt-1">
                              Батарея: {zone.battery}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Управление выбранным участком */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedZone ? `Управление ${selectedZone.name}` : 'Выберите участок'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedZone ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Адрес:</span>
                            <div className="font-medium">{selectedZone.address}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Статус:</span>
                            <div className="font-medium">{getStatusText(selectedZone)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Батарея:</span>
                            <div className="font-medium">{selectedZone.battery}%</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Обновлено:</span>
                            <div className="font-medium">{selectedZone.lastUpdate.toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>

                      {/* Кастомный статус */}
                      <div className="space-y-2">
                        <Label>Кастомный статус:</Label>
                        <div className="flex gap-2">
                          <Select 
                            key={customStatuses.length} // Force re-render when custom statuses change
                            value={selectedZone.customStatus?.id || ''} 
                            onValueChange={(value) => {
                              const status = customStatuses.find(s => s.id === value);
                              setCustomStatus(selectedZone.id, status || null);
                            }}
                          >
                            <SelectTrigger className="flex-1">
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
                      </div>

                      <div className="space-y-3">
                        {selectedZone.status === 'emergency' ? (
                          <Button 
                            onClick={() => resetEmergency(selectedZone.id)}
                            className="w-full"
                            variant="outline"
                          >
                            <Icon name="CheckCircle" size={20} className="mr-2" />
                            Сбросить тревогу
                          </Button>
                        ) : (
                          <>
                            <Button 
                              onClick={() => setProtection(selectedZone.id, true)}
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={selectedZone.status === 'protected'}
                            >
                              <Icon name="Shield" size={20} className="mr-2" />
                              Поставить на охрану
                            </Button>
                            
                            <Button 
                              onClick={() => setProtection(selectedZone.id, false)}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              disabled={selectedZone.status === 'unprotected' && !selectedZone.customStatus}
                            >
                              <Icon name="ShieldOff" size={20} className="mr-2" />
                              Снять с охраны
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          onClick={() => emergencyCall(selectedZone.id)}
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={selectedZone.status === 'emergency'}
                        >
                          <Icon name="Phone" size={20} className="mr-2" />
                          Экстренный вызов ГБР
                        </Button>

                        {/* Управление батареей */}
                        <div className="pt-2 border-t space-y-2">
                          {selectedZone.battery === 100 && (
                            <div className="text-center text-sm text-green-600 font-medium mb-2">
                              <Icon name="Battery" size={16} className="inline mr-1" />
                              Батарея заряжена
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              onClick={() => setBattery(selectedZone.id, true)}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 hover:bg-green-100"
                              disabled={selectedZone.battery === 100}
                            >
                              <Icon name="Battery" size={16} className="mr-1" />
                              Зарядить
                            </Button>
                            <Button 
                              onClick={() => setBattery(selectedZone.id, false)}
                              variant="outline"
                              size="sm"
                              className="bg-red-50 hover:bg-red-100"
                              disabled={selectedZone.battery === 0}
                            >
                              <Icon name="BatteryLow" size={16} className="mr-1" />
                              Разрядить
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Выберите участок из списка слева для управления
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Мониторинг */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="Clock" size={20} className="mr-2" />
                    Время реагирования ГБР
                  </CardTitle>
                  <CardDescription>Статистика экстренных вызовов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {emergencyHistory.filter(c => c.status === 'resolved').length}
                        </div>
                        <div className="text-xs text-gray-600">Обработано</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {emergencyHistory.filter(c => c.status === 'active').length}
                        </div>
                        <div className="text-xs text-gray-600">Активных</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(emergencyHistory.filter(c => c.responseTime).reduce((acc, c) => acc + (c.responseTime || 0), 0) / Math.max(1, emergencyHistory.filter(c => c.responseTime).length)) || 0}
                        </div>
                        <div className="text-xs text-gray-600">Ср. время (мин)</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon name="Activity" size={20} className="mr-2" />
                    История вызовов
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    {emergencyHistory.slice(0, 10).map(call => (
                      <div 
                        key={call.id}
                        className={`p-3 rounded-lg border ${
                          call.status === 'active' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{call.zoneName}</div>
                            <div className="text-sm text-gray-500">
                              {call.timestamp.toLocaleString('ru-RU')}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={call.status === 'active' ? 'destructive' : 'secondary'}
                              className="mb-1"
                            >
                              {call.status === 'active' ? 'Активен' : 'Обработан'}
                            </Badge>
                            {call.responseTime && (
                              <div className="text-xs text-gray-500">
                                {call.responseTime} мин
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Сигнализация - массовые операции */}
          <TabsContent value="alarms" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Массовое управление участками</CardTitle>
                  <CardDescription>
                    Выберите участки для группового управления ({selectedZones.length} выбрано)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Кнопки массовых операций */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={() => massProtection(true)}
                        disabled={selectedZones.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="Shield" size={16} className="mr-2" />
                        Поставить на охрану ({selectedZones.length})
                      </Button>
                      
                      <Button 
                        onClick={() => massProtection(false)}
                        disabled={selectedZones.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Icon name="ShieldOff" size={16} className="mr-2" />
                        Снять с охраны ({selectedZones.length})
                      </Button>
                      
                      <Button 
                        onClick={massEmergencyCall}
                        disabled={selectedZones.length === 0}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Icon name="Phone" size={16} className="mr-2" />
                        ВЫЕЗД ГБР ({selectedZones.length})
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedZones(zones.filter(z => z.contractStatus === 'active').map(z => z.id))}
                        size="sm"
                      >
                        Выбрать все активные
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedZones([])}
                        size="sm"
                      >
                        Очистить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Список участков</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {sortedZones.filter(zone => zone.contractStatus === 'active').map(zone => (
                      <div
                        key={zone.id}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedZones.includes(zone.id) 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'bg-white border-gray-200'
                        }`}
                        style={selectedZones.includes(zone.id) ? {} : { 
                          backgroundColor: getStatusBgColor(zone),
                          borderColor: getStatusColor(zone) + '40'
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedZones.includes(zone.id)}
                            onCheckedChange={() => toggleZoneSelection(zone.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.address}</div>
                          </div>
                          <Badge 
                            style={{ 
                              backgroundColor: getStatusColor(zone), 
                              color: 'white' 
                            }}
                          >
                            {getStatusText(zone)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Отчеты */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>История участков</CardTitle>
                  <CardDescription>Выберите участок для просмотра истории</CardDescription>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <div className="space-y-2">
                    {zones.slice(0, 50).map(zone => (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZoneForReport(zone)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all hover:shadow-md ${
                          selectedZoneForReport?.id === zone.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        style={{ 
                          backgroundColor: getStatusBgColor(zone),
                          borderColor: getStatusColor(zone) + '40'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.address}</div>
                          </div>
                          <Badge 
                            style={{ 
                              backgroundColor: getStatusColor(zone), 
                              color: 'white' 
                            }}
                          >
                            {getStatusText(zone)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedZoneForReport ? `История ${selectedZoneForReport.name}` : 'Выберите участок'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedZoneForReport ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Адрес:</span>
                            <div className="font-medium">{selectedZoneForReport.address}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Телефон:</span>
                            <div className="font-medium">{selectedZoneForReport.phone}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Статус договора:</span>
                            <div className={`font-medium ${getContractStatusColor(selectedZoneForReport.contractStatus)}`}>
                              {getContractStatusText(selectedZoneForReport.contractStatus)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Последнее обновление:</span>
                            <div className="font-medium">{selectedZoneForReport.lastUpdate.toLocaleString('ru-RU')}</div>
                          </div>
                        </div>
                      </div>

                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {zoneHistory
                          .filter(event => event.zoneId === selectedZoneForReport.id)
                          .slice(0, 20)
                          .map(event => (
                            <div key={event.id} className="p-3 bg-white rounded-lg border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{event.details}</div>
                                  {(event.oldValue && event.newValue) && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {event.oldValue} → {event.newValue}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 ml-4">
                                  {event.timestamp.toLocaleString('ru-RU')}
                                </div>
                              </div>
                            </div>
                          ))
                        }
                        {zoneHistory.filter(event => event.zoneId === selectedZoneForReport.id).length === 0 && (
                          <p className="text-gray-500 text-center py-4">История пуста</p>
                        )}
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
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Управление участками</CardTitle>
                  <CardDescription>Создание, изменение и управление договорами</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Создание нового участка */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Добавить новый участок</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="address">Адрес</Label>
                        <Input
                          id="address"
                          placeholder="Введите адрес"
                          value={newZoneAddress}
                          onChange={(e) => setNewZoneAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Номер телефона</Label>
                        <Input
                          id="phone"
                          placeholder="+7XXXXXXXXXX"
                          value={newZonePhone}
                          onChange={(e) => setNewZonePhone(e.target.value)}
                        />
                      </div>
                      <Button onClick={addNewZone} className="w-full">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Создать участок
                      </Button>
                    </div>
                  </div>

                  {/* Создание кастомного статуса */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Создать кастомный статус</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="statusName">Название статуса</Label>
                        <Input
                          id="statusName"
                          placeholder="Например: Ремонт"
                          value={newStatusName}
                          onChange={(e) => setNewStatusName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="statusColor">Цвет</Label>
                        <input
                          type="color"
                          id="statusColor"
                          className="w-full h-10 rounded border cursor-pointer"
                          value={newStatusColor}
                          onChange={(e) => setNewStatusColor(e.target.value)}
                        />
                      </div>
                      <Button onClick={addCustomStatus} className="w-full">
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
                  <CardDescription>Выберите участок для управления договором</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedZone ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="font-medium mb-2">{selectedZone.name}</div>
                        <div className="text-sm text-gray-600 mb-2">{selectedZone.address}</div>
                        <div className="text-sm">
                          Статус договора: 
                          <span className={`ml-1 font-medium ${getContractStatusColor(selectedZone.contractStatus)}`}>
                            {getContractStatusText(selectedZone.contractStatus)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          onClick={() => setContractStatus(selectedZone.id, 'suspended')}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                          disabled={selectedZone.contractStatus === 'suspended'}
                        >
                          <Icon name="Pause" size={16} className="mr-2" />
                          Временно приостановить тариф
                        </Button>
                        
                        <Button 
                          onClick={() => setContractStatus(selectedZone.id, 'active')}
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={selectedZone.contractStatus === 'active'}
                        >
                          <Icon name="Play" size={16} className="mr-2" />
                          Возобновить договор
                        </Button>
                        
                        <Button 
                          onClick={() => setContractStatus(selectedZone.id, 'terminated')}
                          className="w-full bg-red-600 hover:bg-red-700"
                          disabled={selectedZone.contractStatus === 'terminated'}
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Расторгнуть договор
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-500 text-center py-4">
                        Выберите участок во вкладке "Участки" для управления договором
                      </p>
                      
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Быстрый поиск участка</h4>
                        <Select onValueChange={(value) => {
                          const zone = zones.find(z => z.id === parseInt(value));
                          if (zone) setSelectedZone(zone);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите участок" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {zones.slice(0, 50).map(zone => (
                              <SelectItem key={zone.id} value={zone.id.toString()}>
                                {zone.name} - {zone.address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;