import { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import CreatePostModal from '../components/CreatePostModal';
import { initSocket, disconnectSocket } from '../lib/socketClient';

const GET_POSTS_QUERY = gql`
  query GetPosts($page: Int) {
    posts(page: $page) {
      posts {
        _id
        title
        content
        imageUrl
        createdAt
        creator {
          _id
          name
        }
      }
      totalPosts
    }
  }
`;

const GET_USER_QUERY = gql`
  query GetUser {
    user {
      _id
      name
      email
      status
    }
  }
`;

const UPDATE_STATUS_MUTATION = gql`
  mutation UpdateStatus($status: String!) {
    updateStatus(status: $status) {
      _id
      status
    }
  }
`;

const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

function Feed() {
  const [page, setPage] = useState(1);
  const [statusText, setStatusText] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data: postsData, loading: postsLoading, refetch: refetchPosts } = useQuery(GET_POSTS_QUERY, {
    variables: { page },
  });

  const { data: userData, loading: userLoading } = useQuery(GET_USER_QUERY, {
    onCompleted: (data) => {
      setStatusText(data.user.status || '');
    },
  });

  const [updateStatus, { loading: statusUpdateLoading }] = useMutation(UPDATE_STATUS_MUTATION, {
    onCompleted: () => {
      setEditingStatus(false);
    },
    refetchQueries: [{ query: GET_USER_QUERY }],
  });

  const [deletePost] = useMutation(DELETE_POST_MUTATION, {
    onCompleted: () => {
      refetchPosts();
    },
  });

  // إعداد Socket.IO
  useEffect(() => {
    const socket = initSocket();

    socket.on('posts', (data) => {
      console.log('Socket.IO event received:', data);
      
      if (data.action === 'create') {
        console.log('New post created by another user');
        refetchPosts();
      } else if (data.action === 'update') {
        console.log('Post updated by another user');
        refetchPosts();
      } else if (data.action === 'delete') {
        console.log('Post deleted by another user');
        refetchPosts();
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [refetchPosts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusUpdate = () => {
    if (statusText.trim()) {
      updateStatus({ variables: { status: statusText } });
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost({ variables: { id: postId } });
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const totalPages = postsData ? Math.ceil(postsData.posts.totalPosts / 2) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Feed</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {userLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="animate-pulse h-6 bg-slate-200 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Welcome, {userData?.user.name}
                </h2>
                <p className="text-sm text-slate-600">{userData?.user.email}</p>
              </div>
              <button
                onClick={handleCreatePost}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Status
              </label>
              {editingStatus ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
                    placeholder="What's on your mind?"
                  />
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdateLoading}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {statusUpdateLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setStatusText(userData?.user.status || '');
                      setEditingStatus(false);
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg">
                  <p className="text-slate-700">
                    {userData?.user.status || 'No status set'}
                  </p>
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {postsLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : postsData?.posts.posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-slate-600 mb-4">No posts yet. Be the first to create one!</p>
              <button
                onClick={handleCreatePost}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Post
              </button>
            </div>
          ) : (
            postsData?.posts.posts.map((post) => (
              <article key={post._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {post.imageUrl && (
                  <img
                    src={`http://localhost:8080/${post.imageUrl}`}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        by {post.creator.name} •{' '}
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {userData?.user._id === post.creator._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit post"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        {postsData && postsData.posts.totalPosts > 0 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-slate-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onSuccess={() => {
          refetchPosts();
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
      />
    </div>
  );
}

export default Feed;