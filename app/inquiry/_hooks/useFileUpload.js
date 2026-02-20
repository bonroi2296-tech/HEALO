/**
 * 파일 업로드 커스텀 훅
 */
import { useState, useCallback } from 'react';
import { supabase } from '../../../src/supabase';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadFile = useCallback(async (file) => {
    if (!file) return { attachmentPath: null, attachmentsList: [] };

    setUploading(true);
    setUploadError(null);

    try {
      const filePath = `inquiry/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const attachmentsList = [
        {
          path: filePath,
          name: file.name,
          type: file.type || null,
        },
      ];

      setUploading(false);
      return { attachmentPath: filePath, attachmentsList };
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(error);
      setUploading(false);
      throw error;
    }
  }, []);

  return {
    uploading,
    uploadError,
    uploadFile,
  };
}
