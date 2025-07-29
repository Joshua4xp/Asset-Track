import { supabase } from './supabase';
import QRCode from 'qrcode';

export interface QRCodeData {
  id: string;
  assigned_asset_id: string | null;
  status: 'unassigned' | 'assigned';
  created_at: string;
  updated_at: string;
}

// Generate a random 6-character alphanumeric ID
export const generateQRId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate QR code URL
export const generateQRUrl = (qrId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/qr/${qrId}`;
};

// Generate QR code image as data URL
export const generateQRCodeImage = async (qrId: string): Promise<string> => {
  const url = generateQRUrl(qrId);
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code image');
  }
};

// Create unassigned QR codes in database
export const createQRCodes = async (count: number): Promise<QRCodeData[]> => {
  const qrCodes: Omit<QRCodeData, 'created_at' | 'updated_at'>[] = [];
  
  for (let i = 0; i < count; i++) {
    let qrId = generateQRId();
    
    // Ensure unique ID
    const { data: existing } = await supabase
      .from('qr_codes')
      .select('id')
      .eq('id', qrId)
      .single();
    
    while (existing) {
      qrId = generateQRId();
      const { data: checkAgain } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('id', qrId)
        .single();
      if (!checkAgain) break;
    }
    
    qrCodes.push({
      id: qrId,
      assigned_asset_id: null,
      status: 'unassigned'
    });
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .insert(qrCodes)
    .select();

  if (error) {
    throw new Error(`Failed to create QR codes: ${error.message}`);
  }

  return data || [];
};

// Get all QR codes
export const getQRCodes = async (): Promise<QRCodeData[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch QR codes: ${error.message}`);
  }

  return data || [];
};

// Get unassigned QR codes
export const getUnassignedQRCodes = async (): Promise<QRCodeData[]> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('status', 'unassigned')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch unassigned QR codes: ${error.message}`);
  }

  return data || [];
};

// Get QR code by ID
export const getQRCodeById = async (id: string): Promise<QRCodeData | null> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // QR code not found
    }
    throw new Error(`Failed to fetch QR code: ${error.message}`);
  }

  return data;
};

// Assign QR code to asset
export const assignQRCodeToAsset = async (qrId: string, assetId: string): Promise<QRCodeData> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      assigned_asset_id: assetId,
      status: 'assigned',
      updated_at: new Date().toISOString()
    })
    .eq('id', qrId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to assign QR code: ${error.message}`);
  }

  return data;
};

// Unassign QR code from asset
export const unassignQRCode = async (qrId: string): Promise<QRCodeData> => {
  const { data, error } = await supabase
    .from('qr_codes')
    .update({
      assigned_asset_id: null,
      status: 'unassigned',
      updated_at: new Date().toISOString()
    })
    .eq('id', qrId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to unassign QR code: ${error.message}`);
  }

  return data;
};

// Download QR code as image file
export const downloadQRCode = async (qrId: string): Promise<void> => {
  try {
    const dataUrl = await generateQRCodeImage(qrId);
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `QR-${qrId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
};