import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { QrCode, Package, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  getQRCodeById, 
  assignQRCodeToAsset, 
  generateQRCodeImage,
  type QRCodeData 
} from '@/lib/qrCodeAPI';
import { supabase } from '@/lib/supabase';

interface Asset {
  id: string;
  name: string;
  description?: string;
  location?: string;
  project_id: string;
}

const QRAssignment = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  
  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [qrImage, setQrImage] = useState<string>('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Assignment form state
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [showNewAssetForm, setShowNewAssetForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    location: '',
    project_id: ''
  });
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (qrId) {
      loadQRCode();
      loadAssets();
      loadProjects();
    }
  }, [qrId]);

  const loadQRCode = async () => {
    if (!qrId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const qrData = await getQRCodeById(qrId);
      if (!qrData) {
        setError('QR code not found');
        return;
      }
      
      setQrCode(qrData);
      
      // Generate QR code image
      const image = await generateQRCodeImage(qrId);
      setQrImage(image);
      
      // If already assigned, redirect to asset detail
      if (qrData.status === 'assigned' && qrData.assigned_asset_id) {
        navigate(`/asset/${qrData.assigned_asset_id}`);
        return;
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Failed to load assets:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleAssignToExisting = async () => {
    if (!selectedAssetId || !qrId) return;
    
    try {
      setAssigning(true);
      setError(null);
      
      await assignQRCodeToAsset(qrId, selectedAssetId);
      setSuccess('QR code successfully assigned to asset!');
      
      // Redirect to asset detail after 2 seconds
      setTimeout(() => {
        navigate(`/asset/${selectedAssetId}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign QR code');
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateAndAssign = async () => {
    if (!newAsset.name || !newAsset.project_id || !qrId) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setAssigning(true);
      setError(null);
      
      // Create new asset
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .insert([{
          name: newAsset.name,
          description: newAsset.description,
          location: newAsset.location,
          project_id: newAsset.project_id
        }])
        .select()
        .single();
      
      if (assetError) throw assetError;
      
      // Assign QR code to new asset
      await assignQRCodeToAsset(qrId, assetData.id);
      setSuccess('New asset created and QR code assigned successfully!');
      
      // Redirect to asset detail after 2 seconds
      setTimeout(() => {
        navigate(`/asset/${assetData.id}`);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset and assign QR code');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR code...</p>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">QR Code Not Found</h2>
            <p className="text-gray-600 mb-4">The QR code you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">QR Code Assignment</h1>
          <p className="text-sm sm:text-base text-gray-600">Assign this QR code to an asset for tracking</p>
        </div>

        {error && (
          <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800 text-sm">{success}</AlertDescription>
          </Alert>
        )}

        {/* QR Code Info */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">QR Code: {qrCode.id}</span>
            </CardTitle>
            <CardDescription className="text-sm">
              Status: <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {qrCode.status}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {qrImage && (
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <img 
                    src={qrImage} 
                    alt={`QR Code ${qrCode.id}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 border rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1 w-full">
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="break-all"><strong>QR ID:</strong> {qrCode.id}</div>
                  <div className="break-all"><strong>URL:</strong> {window.location.origin}/qr/{qrCode.id}</div>
                  <div><strong>Created:</strong> {new Date(qrCode.created_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Assign to Existing Asset */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Assign to Existing Asset
              </CardTitle>
              <CardDescription className="text-sm">
                Select an existing asset to assign this QR code to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="asset-select" className="text-sm font-medium">Select Asset</Label>
                <div className="mt-1">
                  <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                    <SelectTrigger className="w-full h-11 text-base">
                      <SelectValue placeholder="Choose an asset..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id} className="text-base py-3">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{asset.name}</span>
                            {asset.location && (
                              <span className="text-xs text-gray-500">({asset.location})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleAssignToExisting}
                disabled={!selectedAssetId || assigning}
                className="w-full h-11 text-base"
              >
                {assigning ? 'Assigning...' : 'Assign to Asset'}
              </Button>
            </CardContent>
          </Card>

          {/* Create New Asset */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Create New Asset
              </CardTitle>
              <CardDescription className="text-sm">
                Create a new asset and assign this QR code to it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="asset-name" className="text-sm font-medium">Asset Name *</Label>
                <Input
                  id="asset-name"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter asset name"
                  className="mt-1 h-11 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="asset-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="asset-description"
                  value={newAsset.description}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                  className="mt-1 h-11 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="asset-location" className="text-sm font-medium">Location</Label>
                <Input
                  id="asset-location"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                  className="mt-1 h-11 text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="project-select" className="text-sm font-medium">Project *</Label>
                <div className="mt-1">
                  <Select 
                    value={newAsset.project_id} 
                    onValueChange={(value) => setNewAsset(prev => ({ ...prev, project_id: value }))}
                  >
                    <SelectTrigger className="w-full h-11 text-base">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} className="text-base py-3">
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleCreateAndAssign}
                disabled={!newAsset.name || !newAsset.project_id || assigning}
                className="w-full h-11 text-base"
              >
                {assigning ? 'Creating...' : 'Create Asset & Assign'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRAssignment;