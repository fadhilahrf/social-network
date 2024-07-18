package com.socialnetwork.app.web.rest;

import com.socialnetwork.app.repository.PostRepository;
import com.socialnetwork.app.service.PostService;
import com.socialnetwork.app.service.dto.NotificationDTO;
import com.socialnetwork.app.service.dto.PostDTO;
import com.socialnetwork.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.socialnetwork.app.domain.Post}.
 */
@RestController
@RequestMapping("/api/posts")
public class PostResource {

    private final Logger log = LoggerFactory.getLogger(PostResource.class);

    private static final String ENTITY_NAME = "post";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PostService postService;

    private final PostRepository postRepository;

     private final SimpMessagingTemplate messagingTemplate;

    public PostResource(PostService postService, PostRepository postRepository, SimpMessagingTemplate messagingTemplate) {
        this.postService = postService;
        this.postRepository = postRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * {@code POST  /posts} : Create a new post.
     *
     * @param postDTO the postDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new postDTO, or with status {@code 400 (Bad Request)} if the post has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PostDTO> createPost(@Valid @RequestBody PostDTO postDTO) throws URISyntaxException {
        log.debug("REST request to save Post : {}", postDTO);
        if (postDTO.getId() != null) {
            throw new BadRequestAlertException("A new post cannot already have an ID", ENTITY_NAME, "idexists");
        }
        PostDTO result = postService.save(postDTO);
        return ResponseEntity
            .created(new URI("/api/posts/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable("id") Long id) throws URISyntaxException {
        log.debug("REST request to like Post : {}", id);

         Optional<NotificationDTO> notificationOptional = postService.likePost(id);

         if(notificationOptional.isPresent()) {
            if(!notificationOptional.get().getReceiver().getLogin().equals(notificationOptional.get().getSender().getLogin())) {
                messagingTemplate.convertAndSendToUser(
                    notificationOptional.get().getReceiver().getLogin(), "/notification",
                    notificationOptional.get()
                );
            }

            return ResponseEntity.ok().body(null);
         }

         return ResponseEntity.badRequest().body(null);
    }

    
    @PostMapping("/{id}/unlike")
    public ResponseEntity<?> unlikePost(@PathVariable("id") Long id) throws URISyntaxException {
        log.debug("REST request to like Post : {}", id);

         Optional<NotificationDTO> notificationOptional = postService.unlikePost(id);

         if(notificationOptional.isPresent()) {
            return ResponseEntity.ok().body(null);
         }

         return ResponseEntity.badRequest().body(null);
    }

    /**
     * {@code PUT  /posts/:id} : Updates an existing post.
     *
     * @param id the id of the postDTO to save.
     * @param postDTO the postDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated postDTO,
     * or with status {@code 400 (Bad Request)} if the postDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the postDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PostDTO> updatePost(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PostDTO postDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Post : {}, {}", id, postDTO);
        if (postDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, postDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!postRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        PostDTO result = postService.update(postDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, postDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /posts/:id} : Partial updates given fields of an existing post, field will ignore if it is null
     *
     * @param id the id of the postDTO to save.
     * @param postDTO the postDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated postDTO,
     * or with status {@code 400 (Bad Request)} if the postDTO is not valid,
     * or with status {@code 404 (Not Found)} if the postDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the postDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PostDTO> partialUpdatePost(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PostDTO postDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Post partially : {}, {}", id, postDTO);
        if (postDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, postDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!postRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PostDTO> result = postService.partialUpdate(postDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, postDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /posts} : get all the posts.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of posts in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PostDTO>> getAllPosts(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        log.debug("REST request to get a page of Posts");
        Page<PostDTO> page;
        if (eagerload) {
            page = postService.findAllWithEagerRelationships(pageable);
        } else {
            page = postService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostDTO>> getAll(@RequestParam(value = "limit", required = false) Integer limit) {
        log.debug("REST request to get all Posts");
        if(limit==null) {
            return ResponseEntity.ok().body(postService.findAllByOrderByCreatedDateDesc());
        }
        List<PostDTO> result = postService.findAllByOrderByCreatedDateDescLimit(limit);

        Integer maxLimit = Long.valueOf(postRepository.count()).intValue();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Is-Max", String.valueOf(result.size()>=maxLimit));

        return ResponseEntity.ok().headers(headers).body(result);
    }

    @GetMapping("/author/{id}")
    public ResponseEntity<List<PostDTO>> getAllPostsByAuthorId(@PathVariable("id") Long id, @RequestParam(value = "limit", required = false) Integer limit) {
        log.debug("REST request to get a page of Posts by Author id");
        if(limit==null) {
            return ResponseEntity.ok().body(postService.findAllByAuthorIdOrderByCreatedDateDesc(id));
        }
        List<PostDTO> result = postService.findAllByAuthorIdOrderByCreatedDateDescLimit(id, limit);

        Integer maxLimit = postRepository.countByAuthorId(id);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Is-Max", String.valueOf(result.size()>=maxLimit));

        return ResponseEntity.ok().headers(headers).body(result);
    }

    /**
     * {@code GET  /posts/:id} : get the "id" post.
     *
     * @param id the id of the postDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the postDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(@PathVariable("id") Long id) {
        log.debug("REST request to get Post : {}", id);
        Optional<PostDTO> postDTO = postService.findOne(id);
        return ResponseUtil.wrapOrNotFound(postDTO);
    }

    /**
     * {@code DELETE  /posts/:id} : delete the "id" post.
     *
     * @param id the id of the postDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long id) {
        log.debug("REST request to delete Post : {}", id);
        postService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
