import { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { X, UploadCloud } from 'lucide-react'; // أيقونة جديدة

const CREATE_POST_MUTATION = gql`
  mutation CreatePost($postInput: PostInputData) {
    createPost(postInput: $postInput) {
      _id
      title
      content
      imageUrl
    }
  }
`;

const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($id: ID!, $postInput: PostInputData) {
    updatePost(id: $id, postInput: $postInput) {
      _id
      title
      content
      imageUrl
    }
  }
`;

function CreatePostModal({ isOpen, onClose, onSuccess, editingPost }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null); // للملف الجديد
  const [imagePreview, setImagePreview] = useState(''); // للعرض فقط
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false); // حالة الرفع

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      // لو فيه صورة قديمة، اعرضها، وحط رابطها
      setImagePreview(editingPost.imageUrl ? `http://localhost:8080/${editingPost.imageUrl}` : '');
      setImageFile(editingPost.imageUrl); // نحتفظ بالرابط القديم مؤقتاً
    } else {
      resetForm();
    }
    setError('');
  }, [editingPost, isOpen]);

  const [createPost, { loading: createLoading }] = useMutation(CREATE_POST_MUTATION, {
    onCompleted: () => { onSuccess(); resetForm(); },
    onError: (err) => setError(err.message)
  });

  const [updatePost, { loading: updateLoading }] = useMutation(UPDATE_POST_MUTATION, {
    onCompleted: () => { onSuccess(); resetForm(); },
    onError: (err) => setError(err.message)
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setImagePreview('');
    setError('');
  };

  // دالة لاختيار الملف وعرضه فوراً
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // عمل رابط وهمي عشان نعرض الصورة لليوزر قبل ما تترفع
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Title and Content are required');
      return;
    }

    if (!imageFile && !editingPost) {
      setError('Please verify an image is selected');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = imageFile;

    // 1. لو المستخدم اختار ملف جديد، نرفعه الأول بـ REST
    if (typeof imageFile === 'object') {
      const formData = new FormData();
      formData.append('image', imageFile); // 'image' ده نفس الاسم اللي في multer config

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/post-image', {
          method: 'PUT',
          headers: {
            Authorization: 'Bearer ' + token // مهم جداً عشان الـ auth middleware
          },
          body: formData
        });
        
        const resData = await response.json();
        if (resData.filePath) {
            // بنحول السلاش عشان الويندوز ولينكس
            finalImageUrl = resData.filePath.replace("\\", "/"); 
        } else {
            throw new Error('Failed to upload image');
        }
      } catch (err) {
        setError('Image upload failed');
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    // 2. دلوقتي معانا الرابط (سواء جديد أو قديم)، نبعت للـ GraphQL
    const postInput = {
      title: title.trim(),
      content: content.trim(),
      imageUrl: finalImageUrl || 'undefined', // لو مفيش صورة
    };

    if (editingPost) {
      updatePost({ variables: { id: editingPost._id, postInput } });
    } else {
      createPost({ variables: { postInput } });
    }
  };

  if (!isOpen) return null;
  const isLoading = createLoading || updateLoading || isUploading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* حقل العنوان */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Post Title"
              disabled={isLoading}
            />
          </div>

          {/* حقل رفع الصورة الجديد */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Post Image</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                </div>
                <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*" // نقبل صور بس
                />
              </label>
            </div>
          </div>

          {/* معاينة الصورة */}
          {imagePreview && (
            <div className="rounded-lg overflow-hidden border border-slate-200 relative">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button 
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(''); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs"
              >
                Remove
              </button>
            </div>
          )}

          {/* حقل المحتوى */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-500 resize-none"
              placeholder="What's on your mind?"
              disabled={isLoading}
            />
          </div>

          {/* الأزرار */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : (editingPost ? 'Update Post' : 'Create Post')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;