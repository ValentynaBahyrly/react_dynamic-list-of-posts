import React, { useState, useEffect } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';
import { client } from '../utils/fetchClient';

export const PostDetails: React.FC<{ post: Post }> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentsError, setIsCommentsError] = useState(false);
  const [isFormaOpen, setIsFormaOpen] = useState(false);

  useEffect(() => {
    setIsFormaOpen(false);
    setIsCommentsLoading(true);
    setIsCommentsError(false);

    client
      .get<Comment[]>(`/comments?postId=${post.id}`)
      .then(loadedComments => setComments(loadedComments))
      .catch(() => {
        setIsCommentsError(true);
      })
      .finally(() => {
        setIsCommentsLoading(false);
      });
  }, [post.id]);

  const handleDeleteComment = (commentId: number) => {
    const backupComments = [...comments];

    setComments(current => current.filter(comment => comment.id !== commentId));
    setIsCommentsError(false);

    client.delete(`/comments/${commentId}`).catch(() => {
      setComments(backupComments);
      setIsCommentsError(true);
    });
  };

  return (
    <div className="content" data-cy="PostDetails">
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">
            #{post.id}: {post.title}
          </h2>

          <p data-cy="PostBody">{post.body}</p>
        </div>

        <div className="block">
          {isCommentsLoading && <Loader />}

          {!isCommentsLoading && (
            <>
              {isCommentsError && (
                <div className="notification is-danger" data-cy="CommentsError">
                  Something went wrong
                </div>
              )}

              {!isCommentsError && comments.length === 0 && (
                <p className="title is-4" data-cy="NoCommentsMessage">
                  No comments yet
                </p>
              )}

              {!isCommentsError && comments.length > 0 && (
                <>
                  <p className="title is-4">Comments:</p>

                  {comments.map(comment => (
                    <article
                      key={comment.id}
                      className="message is-small"
                      data-cy="Comment"
                    >
                      <div className="message-header">
                        <a
                          href={`mailto:${comment.email}`}
                          data-cy="CommentAuthor"
                        >
                          {comment.name}
                        </a>
                        <button
                          data-cy="CommentDelete"
                          type="button"
                          className="delete is-small"
                          aria-label="delete"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          delete button
                        </button>
                      </div>

                      <div className="message-body" data-cy="CommentBody">
                        {comment.body}
                      </div>
                    </article>
                  ))}
                </>
              )}
            </>
          )}
          {!isCommentsLoading && !isCommentsError && (
            <>
              {!isFormaOpen ? (
                <button
                  data-cy="WriteCommentButton"
                  type="button"
                  className="button is-link"
                  onClick={() => setIsFormaOpen(true)}
                >
                  Write a comment
                </button>
              ) : (
                <NewCommentForm
                  postId={post.id}
                  onAddComment={newComment =>
                    setComments(current => [...current, newComment])
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
