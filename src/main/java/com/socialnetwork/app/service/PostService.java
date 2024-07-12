package com.socialnetwork.app.service;

import com.socialnetwork.app.domain.Notification;
import com.socialnetwork.app.domain.Post;
import com.socialnetwork.app.domain.User;
import com.socialnetwork.app.domain.enumeration.NotificationType;
import com.socialnetwork.app.repository.NotificationRepository;
import com.socialnetwork.app.repository.PostRepository;
import com.socialnetwork.app.security.SecurityUtils;
import com.socialnetwork.app.service.dto.AdminUserDTO;
import com.socialnetwork.app.service.dto.NotificationDTO;
import com.socialnetwork.app.service.dto.PostDTO;
import com.socialnetwork.app.service.mapper.PostMapper;

import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.socialnetwork.app.domain.Post}.
 */
@Service
@Transactional
public class PostService {

    private final Logger log = LoggerFactory.getLogger(PostService.class);

    private final PostRepository postRepository;

    private final UserService userService;

    private final NotificationRepository notificationRepository;

    private final PostMapper postMapper;

    public PostService(PostRepository postRepository, UserService userService,NotificationRepository notificationRepository, PostMapper postMapper) {
        this.postRepository = postRepository;
        this.userService = userService;
        this.notificationRepository = notificationRepository;
        this.postMapper = postMapper;
    }

    /**
     * Save a post.
     *
     * @param postDTO the entity to save.
     * @return the persisted entity.
     */
    public PostDTO save(PostDTO postDTO) {
        log.debug("Request to save Post : {}", postDTO);
        Post post = postMapper.toEntity(postDTO);
        User author = userService.getUserWithAuthoritiesByLogin(post.getAuthor().getLogin()).get();
        post = postRepository.save(post);
        author.setPostCount(author.getPostCount()+1);
        userService.updateUser(new AdminUserDTO(author));
        return postMapper.toDto(post);
    }

    /**
     * Update a post.
     *
     * @param postDTO the entity to save.
     * @return the persisted entity.
     */
    public PostDTO update(PostDTO postDTO) {
        log.debug("Request to update Post : {}", postDTO);
        Post post = postMapper.toEntity(postDTO);
        post = postRepository.save(post);
        return postMapper.toDto(post);
    }

    /**
     * Partially update a post.
     *
     * @param postDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PostDTO> partialUpdate(PostDTO postDTO) {
        log.debug("Request to partially update Post : {}", postDTO);

        return postRepository
            .findById(postDTO.getId())
            .map(existingPost -> {
                postMapper.partialUpdate(existingPost, postDTO);

                return existingPost;
            })
            .map(postRepository::save)
            .map(postMapper::toDto);
    }

    /**
     * Get all the posts.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<PostDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Posts");
        return postRepository.findAll(pageable).map(postMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<PostDTO> findAllByOrderByCreatedDateDesc() {
        log.debug("Request to get all Posts order by created date");
        return postRepository.findAllByOrderByCreatedDateDesc().stream().map(postMapper::toDto).toList();
    }

    /**
     * Get all the posts with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<PostDTO> findAllWithEagerRelationships(Pageable pageable) {
        return postRepository.findAllWithEagerRelationships(pageable).map(postMapper::toDto);
    }

    public List<PostDTO> findAllByAuthorIdOrderByCreatedDateDesc(Long id) {
        log.debug("Request to get All Post by Author : {}", id);
        Optional<String> currentUserLoginOptional = SecurityUtils.getCurrentUserLogin();

        return postRepository.findAllByAuthorIdOrderByCreatedDateDescWithEagerRelationships(id).stream().map(post->{
            PostDTO postDTO = postMapper.toDto(post);

            if(currentUserLoginOptional.isPresent()) {
                for(User liker: post.getLikes()) {
                    if(liker.getLogin().equals(currentUserLoginOptional.get())) {
                        postDTO.setLikedByMe(true);
                        break;
                    }
                }
            }

            return postDTO;
        }).toList();
    }

    public Optional<NotificationDTO> likePost(Long id) {
        log.debug("Request to like Post by id : {}", id);

        Optional<User> userOptional = userService.getCurrentUser();

        if(userOptional.isPresent()) {
            Optional<Post> postOptional = postRepository.findById(id);

            if(postOptional.isPresent()) {
                Post post = postOptional.get();

                post.addLikes(userOptional.get());
                post.setLikeCount(post.getLikeCount()+1);

                postRepository.save(post);

                Notification notification = new Notification();
                notification.setType(NotificationType.POST_LIKED);
                notification.setDestination(post.getAuthor().getLogin()+"/post/"+post.getId());
                notification.setSender(userOptional.get());
                notification.setReceiver(post.getAuthor());
                notification.setMessage("<b>"+userOptional.get().getLogin()+"</b> liked your post.");
                notification.setIsRead(false);

                return Optional.of(notificationRepository.save(notification)).map(NotificationDTO::new);
            }
        }

        return Optional.empty();
    }

    public Optional<NotificationDTO> unlikePost(Long id) {
        log.debug("Request to like Post by id : {}", id);

        Optional<User> userOptional = userService.getCurrentUser();

        if(userOptional.isPresent()) {
            Optional<Post> postOptional = postRepository.findById(id);

            if(postOptional.isPresent()) {
                Post post = postOptional.get();

                post.removeLikes(userOptional.get());
                post.setLikeCount(post.getLikeCount()-1);

                postRepository.save(post);

                Optional<Notification> notificationOptional = notificationRepository.findOneByDestinationAndTypeAndSenderAndReceiver(post.getAuthor().getLogin()+"/post/"+post.getId(), NotificationType.POST_LIKED, userOptional.get(), post.getAuthor());

                if(notificationOptional.isPresent()) {
                    notificationRepository.delete(notificationOptional.get());
    
                    return Optional.of(notificationOptional.get()).map(NotificationDTO::new);
                }
            }
        }

        return Optional.empty();
    }

    /**
     * Get one post by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PostDTO> findOne(Long id) {
        log.debug("Request to get Post : {}", id);
        return postRepository.findOneWithEagerRelationships(id).map(postMapper::toDto);
    }

    /**
     * Delete the post by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Post : {}", id);
        postRepository.deleteById(id);
    }
}
