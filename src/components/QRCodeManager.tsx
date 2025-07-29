import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Download, QrCode, Plus, RefreshCw } from 'lucide-react';
import { 
  createQRCodes, 
  getQRCodes, 
  downloadQRCode, 
  generateQRCodeImage,
  type QRCodeData 
} from '@/lib/qrCodeAPI';

const QRCodeManager = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const codes = await getQRCodes();
      setQrCodes(codes);
      
      // Generate images for first 20 QR codes for preview
      const imagesToLoad = codes.slice(0, 20);
      const imagePromises = imagesToLoad.map(async (qr) => {
        try {
          const image = await generateQRCodeImage(qr.id);
          return { id: qr.id, image };
        } catch (err) {
          console.error(`Failed to generate image for QR ${qr.id}:`, err);
          return null;
        }
      });
      
      const images = await Promise.all(imagePromises);
      const imageMap: Record<string, string> = {};
      images.forEach(img => {
        if (img) imageMap[img.id] = img.image;
      });
      setQrImages(imageMap);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCodes = async () => {
    if (count < 1 || count > 50) {
      setError('Count must be between 1 and 50');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      await createQRCodes(count);
      await loadQRCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR codes');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (qrId: string) => {
    try {
      await downloadQRCode(qrId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download QR code');
    }
  };

  const unassignedCount = qrCodes.filter(qr => qr.status === 'unassigned').length;
  const assignedCount = qrCodes.filter(qr => qr.status === 'assigned').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Manager</h1>
          <p className="text-gray-600">Generate and manage QR codes for asset tracking</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Total QR Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{qrCodes.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Unassigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{unassignedCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{assignedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate QR Codes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Generate New QR Codes
            </CardTitle>
            <CardDescription>
              Create new unassigned QR codes for asset tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  placeholder="Number of QR codes"
                />
              </div>
              <Button 
                onClick={handleGenerateQRCodes}
                disabled={generating}
                className="flex items-center gap-2"
              >
                {generating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <QrCode className="h-4 w-4" />
                )}
                {generating ? 'Generating...' : 'Generate QR Codes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Codes List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>QR Codes</CardTitle>
              <CardDescription>Manage your generated QR codes</CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={loadQRCodes}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading QR codes...
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No QR codes generated yet. Create some to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qrCodes.map((qr) => (
                  <div key={qr.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-mono text-lg font-semibold">{qr.id}</div>
                      <Badge 
                        variant={qr.status === 'assigned' ? 'default' : 'secondary'}
                        className={qr.status === 'assigned' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}
                      >
                        {qr.status}
                      </Badge>
                    </div>
                    
                    {qrImages[qr.id] && (
                      <div className="mb-3 flex justify-center">
                        <img 
                          src={qrImages[qr.id]} 
                          alt={`QR Code ${qr.id}`}
                          className="w-24 h-24 border rounded"
                        />
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div>Created: {new Date(qr.created_at).toLocaleDateString()}</div>
                      {qr.assigned_asset_id && (
                        <div>Asset: {qr.assigned_asset_id}</div>
                      )}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(qr.id)}
                        className="flex-1 flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      {qr.status === 'unassigned' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => window.open(`/qr/${qr.id}`, '_blank')}
                          className="flex-1"
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeManager;