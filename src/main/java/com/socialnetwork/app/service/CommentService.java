package com.socialnetwork.app.service;

import com.socialnetwork.app.domain.Comment;
import com.socialnetwork.app.domain.Notification;
import com.socialnetwork.app.domain.Post;
import com.socialnetwork.app.domain.enumeration.NotificationType;
import com.socialnetwork.app.repository.CommentRepository;
import com.socialnetwork.app.repository.NotificationRepository;
import com.socialnetwork.app.repository.PostRepository;
import com.socialnetwork.app.service.dto.CommentDTO;
import com.socialnetwork.app.service.dto.NotificationDTO;
import com.socialnetwork.app.service.mapper.CommentMapper;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.socialnetwork.app.domain.Comment}.
 */
@Service
@Transactional
public class CommentService {

    private final Logger log = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;

    private final PostRepository postRepository;

    private final NotificationRepository notificationRepository;

    private final CommentMapper commentMapper;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, NotificationRepository notificationRepository, CommentMapper commentMapper) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.notificationRepository = notificationRepository;
        this.commentMapper = commentMapper;
    }

    /**
     * Save a comment.
     *
     * @param commentDTO the entity to save.
     * @return the persisted entity.
     */
    public CommentDTO save(CommentDTO commentDTO) {
        log.debug("Request to save Comment : {}", commentDTO);
        Comment comment = commentMapper.toEntity(commentDTO);
        Post post = postRepository.findById(comment.getPost().getId()).get();
        comment = commentRepository.save(comment);
        post.setCommentCount(post.getCommentCount()+1);
        postRepository.save(post);
        return commentMapper.toDto(comment);
    }

    public Optional<NotificationDTO> send(CommentDTO commentDTO) {
        log.debug("Request to send Comment : {}", commentDTO);
        Comment comment = commentMapper.toEntity(commentDTO);
        Optional<Post> postOptional = postRepository.findById(comment.getPost().getId());
        
        if(postOptional.isPresent()) {
            Post post = postOptional.get();
            comment = commentRepository.save(comment);
            post.setCommentCount(post.getCommentCount()+1);
            post = postRepository.save(post);
 
            Notification notification = new Notification();
            notification.setType(NotificationType.POST_COMMENTED);
            notification.setDestination(post.getAuthor().getLogin()+"/post/"+post.getId()+"/comment/"+comment.getId());
            notification.setSender(comment.getAuthor());
            notification.setReceiver(post.getAuthor());
            notification.setMessage("<b>"+comment.getAuthor().getLogin()+"</b> commented your post");
            notification.setIsRead(false);

            notification = notificationRepository.save(notification);
            
            NotificationDTO notificationDTO = new NotificationDTO(notification);
            notificationDTO.setObject(commentMapper.toDto(comment));

            return Optional.of(notificationDTO);
        }
        return Optional.empty();
    }

    /**
     * Update a comment.
     *
     * @param commentDTO the entity to save.
     * @return the persisted entity.
     */
    public CommentDTO update(CommentDTO commentDTO) {
        log.debug("Request to update Comment : {}", commentDTO);
        Comment comment = commentMapper.toEntity(commentDTO);
        comment = commentRepository.save(comment);
        return commentMapper.toDto(comment);
    }

    /**
     * Partially update a comment.
     *
     * @param commentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CommentDTO> partialUpdate(CommentDTO commentDTO) {
        log.debug("Request to partially update Comment : {}", commentDTO);

        return commentRepository
            .findById(commentDTO.getId())
            .map(existingComment -> {
                commentMapper.partialUpdate(existingComment, commentDTO);

                return existingComment;
            })
            .map(commentRepository::save)
            .map(commentMapper::toDto);
    }

    /**
     * Get all the comments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CommentDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Comments");
        return commentRepository.findAll(pageable).map(commentMapper::toDto);
    }

    /**
     * Get all the comments with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CommentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return commentRepository.findAllWithEagerRelationships(pageable).map(commentMapper::toDto);
    }

    public List<CommentDTO> findAllByPostId(Long id) {
        log.debug("Request to get all Comments by post id");
        return commentRepository.findAllByPostIdOrderByCreatedDateDesc(id).stream().map(commentMapper::toDto).toList();
    }

    /**
     * Get one comment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CommentDTO> findOne(Long id) {
        log.debug("Request to get Comment : {}", id);
        return commentRepository.findOneWithEagerRelationships(id).map(commentMapper::toDto);
    }

    /**
     * Delete the comment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Comment : {}", id);
        commentRepository.deleteById(id);
    }

    public Optional<NotificationDTO> deleteFromPost(Long id) {
        log.debug("Request to delete Comment from post: {}", id);

        Optional<Comment> commentOptional = commentRepository.findById(id);

        if(commentOptional.isPresent()) {
            commentRepository.delete(commentOptional.get());
            Post post = postRepository.findById(commentOptional.get().getPost().getId()).get();
            post.setCommentCount(post.getCommentCount()-1);

            post = postRepository.save(post);

            Optional<Notification> notificationOptional = notificationRepository.findOneByDestinationAndTypeAndSenderAndReceiver(post.getAuthor().getLogin()+"/post/"+commentOptional.get().getPost().getId()+"/comment/"+commentOptional.get().getId(), NotificationType.POST_COMMENTED, commentOptional.get().getAuthor(), post.getAuthor());
        
            if(notificationOptional.isPresent()) {
                notificationRepository.delete(notificationOptional.get());
    
                return Optional.of(notificationOptional.get()).map(NotificationDTO::new);
            }
        }

        return Optional.empty(); 
    }
}
