import React from 'react';
import { Bell, CloudRain, Bug, AlertTriangle, Droplets, Sun } from 'lucide-react';
import { useLanguage } from '../components/i18n/LanguageContext';
import TopBar from '../components/layout/TopBar';

const mockAlerts = [
  { type: 'weather', icon: CloudRain, title: 'Heavy Rain Expected', desc: 'Heavy rainfall expected in next 48 hours. Secure crops and ensure drainage.', time: '2 hours ago', color: 'bg-blue-100 text-blue-600' },
  { type: 'pest', icon: Bug, title: 'Pest Alert: Whitefly', desc: 'Whitefly outbreaks reported in nearby regions. Check cotton crops.', time: '5 hours ago', color: 'bg-red-100 text-red-600' },
  { type: 'drought', icon: Sun, title: 'Heatwave Advisory', desc: 'Temperatures above 42°C expected. Increase irrigation frequency.', time: '1 day ago', color: 'bg-amber-100 text-amber-600' },
  { type: 'irrigation', icon: Droplets, title: 'Low Soil Moisture', desc: 'Soil moisture dropped below 30%. Immediate irrigation recommended.', time: '1 day ago', color: 'bg-cyan-100 text-cyan-600' },
  { type: 'market', icon: AlertTriangle, title: 'Price Drop: Tomato', desc: 'Tomato prices dropped 15% in local mandi. Consider storage.', time: '2 days ago', color: 'bg-orange-100 text-orange-600' },
];

export default function Alerts() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={t('navAlerts')} showLangSelector={false} />

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {mockAlerts.map((alert, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 flex gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.color}`}>
              <alert.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{alert.desc}</p>
              <p className="text-[10px] text-gray-400 mt-1.5">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
