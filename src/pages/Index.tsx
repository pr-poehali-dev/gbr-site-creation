import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

// Типы данных
interface SecurityZone {
  id: number;
  name: string;
  address: string;
  status: 'protected' | 'unprotected' | 'emergency';
  lastUpdate: Date;
  battery: number;
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

  // Инициализация 125 участков
  useEffect(() => {
    const initialZones: SecurityZone[] = Array.from({ length: 125 }, (_, i) => ({
      id: i + 1,
      name: `Участок ${i + 1}`,
      address: `ул. Охранная, ${i + 1}`,
      status: Math.random() > 0.7 ? 'protected' : 'unprotected',
      lastUpdate: new Date(),
      battery: Math.floor(Math.random() * 100) + 1,
    }));
    setZones(initialZones);
  }, []);

  // Симуляция срабатывания сигнализации каждые 5 минут
  useEffect(() => {
    const interval = setInterval(() => {
      const randomZoneId = Math.floor(Math.random() * 125) + 1;
      const zone = zones.find(z => z.id === randomZoneId);
      if (zone) {
        setZones(prev => prev.map(zone => 
          zone.id === randomZoneId 
            ? { ...zone, status: 'emergency', lastUpdate: new Date() }
            : zone
        ));
        setEmergencyCalls(prev => [...prev, randomZoneId]);
        
        // Добавляем в историю
        const newCall: EmergencyCall = {
          id: `${randomZoneId}-${Date.now()}`,
          zoneId: randomZoneId,
          zoneName: `Участок ${randomZoneId}`,
          timestamp: new Date(),
          status: 'active'
        };
        setEmergencyHistory(prev => [newCall, ...prev]);
      }
    }, 30000); // Для демо каждые 30 секунд

    return () => clearInterval(interval);
  }, [zones]);

  // Функции управления
  const setProtection = (zoneId: number, protect: boolean) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { ...zone, status: protect ? 'protected' : 'unprotected', lastUpdate: new Date() }
        : zone
    ));
  };

  const setBattery = (zoneId: number, charge: boolean) => {
    setZones(prev => prev.map(zone => 
      zone.id === zoneId 
        ? { ...zone, battery: charge ? 100 : Math.max(0, zone.battery - 20), lastUpdate: new Date() }
        : zone
    ));
  };

  const emergencyCall = (zoneId: number) => {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) {
      setZones(prev => prev.map(zone => 
        zone.id === zoneId 
          ? { ...zone, status: 'emergency', lastUpdate: new Date() }
          : zone
      ));
      setEmergencyCalls(prev => [zoneId, ...prev]);
      
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
    total: zones.length
  };

  // Сортировка участков для отображения экстренных вызовов первыми
  const sortedZones = [...zones].sort((a, b) => {
    if (a.status === 'emergency' && b.status !== 'emergency') return -1;
    if (a.status !== 'emergency' && b.status === 'emergency') return 1;
    return a.id - b.id;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'protected': return 'bg-green-500';
      case 'emergency': return 'bg-red-500 animate-pulse';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'protected': return 'Под охраной';
      case 'emergency': return 'ВЫЕЗД ГБР';
      default: return 'Не охраняется';
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'protected': return 'default';
      case 'emergency': return 'destructive';
      default: return 'secondary';
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    и безопасность 125 объектов.
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
                          zone.status === 'emergency' 
                            ? 'bg-red-100 border-red-300' 
                            : zone.status === 'protected'
                            ? 'bg-green-50 border-green-300'
                            : 'bg-blue-50 border-blue-200'
                        } ${selectedZone?.id === zone.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.address}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getBadgeVariant(zone.status)} className={
                              zone.status === 'protected' ? 'bg-green-500 text-white' :
                              zone.status === 'emergency' ? 'bg-red-500 text-white' :
                              'bg-blue-500 text-white'
                            }>
                              {getStatusText(zone.status)}
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
                            <div className="font-medium">{getStatusText(selectedZone.status)}</div>
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
                              disabled={selectedZone.status === 'unprotected'}
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
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                          <Button 
                            onClick={() => setBattery(selectedZone.id, true)}
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100"
                          >
                            <Icon name="Battery" size={16} className="mr-1" />
                            Зарядить
                          </Button>
                          <Button 
                            onClick={() => setBattery(selectedZone.id, false)}
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100"
                          >
                            <Icon name="BatteryLow" size={16} className="mr-1" />
                            Разрядить
                          </Button>
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
                          {emergencyHistory.filter(c => c.responseTime).reduce((acc, c) => acc + (c.responseTime || 0), 0) / Math.max(1, emergencyHistory.filter(c => c.responseTime).length) || 0}
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
                        onClick={() => setSelectedZones(zones.map(z => z.id))}
                        size="sm"
                      >
                        Выбрать все
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
                    {sortedZones.map(zone => (
                      <div
                        key={zone.id}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedZones.includes(zone.id) 
                            ? 'bg-blue-100 border-blue-300' 
                            : zone.status === 'emergency' 
                            ? 'bg-red-100 border-red-300' 
                            : zone.status === 'protected'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}
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
                          <Badge variant={getBadgeVariant(zone.status)} className={
                            zone.status === 'protected' ? 'bg-green-500 text-white' :
                            zone.status === 'emergency' ? 'bg-red-500 text-white' :
                            'bg-blue-500 text-white'
                          }>
                            {getStatusText(zone.status)}
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
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Отчеты и статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Раздел в разработке...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Настройки */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки системы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Раздел в разработке...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;