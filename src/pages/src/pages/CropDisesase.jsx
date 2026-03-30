import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Upload, Loader2, AlertCircle, Shield, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../components/i18n/LanguageContext';
import { base44 } from '@/api/base44Client';

export default function CropDisease() {
  const { t, lang } = useLanguage();
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);

      const langNames = { en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada' };
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert plant pathologist. Analyze this crop/plant leaf image and provide a diagnosis. Respond in ${langNames[lang] || 'English'}. If you cannot determine a specific disease, provide general observations about the plant health.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            disease: { type: "string" },
            severity: { type: "string", enum: ["low", "medium", "high"] },
            pesticide: { type: "string" },
            prevention: { type: "string" },
            description: { type: "string" }
          }
        }
      });
      setResult(analysis);
    } catch {
      setResult({ disease: "Analysis failed", severity: "unknown", pesticide: "-", prevention: "-", description: "Could not analyze image." });
    }
    setLoading(false);
  };

  const severityColor = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 bg-lime-600 text-white px-4 py-3 flex items-center gap-3">
        <Link to="/Home"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold">{t('featureDisease')}</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Upload section */}
        <div
          onClick={() => fileRef.current?.click()}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-lime-400 transition-colors"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Crop" className="w-full h-48 object-cover rounded-xl" />
          ) : (
            <>
              <Camera className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500 text-center">{t('uploadPrompt')}</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {!imageUrl && (
          <Button onClick={() => fileRef.current?.click()} className="w-full bg-lime-600 hover:bg-lime-700 rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            {t('uploadImage')}
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-lime-600" />
            <span className="text-sm text-gray-600">{t('analyzing')}</span>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="w-5 h-5 text-lime-600" />
                  <h3 className="font-bold text-gray-900">{t('detectedDisease')}</h3>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${severityColor[result.severity] || 'bg-gray-100 text-gray-600'}`}>
                  {result.severity}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 mt-2">{result.disease}</p>
              {result.description && <p className="text-xs text-gray-500 mt-1">{result.description}</p>}
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('pesticide')}</p>
                <p className="text-sm text-gray-800 mt-0.5">{result.pesticide}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{t('preventionTips')}</p>
                <p className="text-sm text-gray-800 mt-0.5">{result.prevention}</p>
              </div>
            </div>
          </div>
        )}

        {imageUrl && !loading && (
          <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }} className="w-full rounded-xl">
            {t('uploadImage')}
          </Button>
        )}
      </div>
    </div>
  );
}
