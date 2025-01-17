package com.socialnetwork.app.web.rest;

import com.socialnetwork.app.repository.CommentRepository;
import com.socialnetwork.app.service.CommentService;
import com.socialnetwork.app.service.dto.CommentDTO;
import com.socialnetwork.app.service.dto.NotificationDTO;
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
 * REST controller for managing {@link com.socialnetwork.app.domain.Comment}.
 */
@RestController
@RequestMapping("/api/comments")
public class CommentResource {

    private final Logger log = LoggerFactory.getLogger(CommentResource.class);

    private static final String ENTITY_NAME = "comment";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CommentService commentService;

    private final CommentRepository commentRepository;
    
    private final SimpMessagingTemplate messagingTemplate;

    public CommentResource(CommentService commentService, CommentRepository commentRepository, SimpMessagingTemplate messagingTemplate) {
        this.commentService = commentService;
        this.commentRepository = commentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * {@code POST  /comments} : Create a new comment.
     *
     * @param commentDTO the commentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new commentDTO, or with status {@code 400 (Bad Request)} if the comment has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CommentDTO> createComment(@Valid @RequestBody CommentDTO commentDTO) throws URISyntaxException {
        log.debug("REST request to save Comment : {}", commentDTO);
        if (commentDTO.getId() != null) {
            throw new BadRequestAlertException("A new comment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CommentDTO result = commentService.save(commentDTO);
        return ResponseEntity
            .created(new URI("/api/comments/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PostMapping("/send")
    public ResponseEntity<CommentDTO> sendComment(@Valid @RequestBody CommentDTO commentDTO) {
        log.debug("REST request to send Comment : {}", commentDTO);

        Optional<NotificationDTO> notificationOptional = commentService.send(commentDTO);

         if(notificationOptional.isPresent()) {
            if(!notificationOptional.get().getReceiver().getLogin().equals(notificationOptional.get().getSender().getLogin())) {
                messagingTemplate.convertAndSendToUser(
                    notificationOptional.get().getReceiver().getLogin(), "/notification",
                    notificationOptional.get()
                );
            }

            return ResponseEntity.ok().body((CommentDTO) notificationOptional.get().getObject());
         }

         return ResponseEntity.badRequest().body(null);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeComment(@PathVariable("id") Long id) throws URISyntaxException {
        log.debug("REST request to like Comment : {}", id);

         Optional<NotificationDTO> notificationOptional = commentService.likeComment(id);

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
    public ResponseEntity<?> unlikeComment(@PathVariable("id") Long id) throws URISyntaxException {
        log.debug("REST request to like Comment : {}", id);

         Optional<NotificationDTO> notificationOptional = commentService.unlikeComment(id);

         if(notificationOptional.isPresent()) {
            return ResponseEntity.ok().body(null);
         }

         return ResponseEntity.badRequest().body(null);
    }

    /**
     * {@code PUT  /comments/:id} : Updates an existing comment.
     *
     * @param id the id of the commentDTO to save.
     * @param commentDTO the commentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated commentDTO,
     * or with status {@code 400 (Bad Request)} if the commentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the commentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CommentDTO commentDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Comment : {}, {}", id, commentDTO);
        if (commentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, commentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!commentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        CommentDTO result = commentService.update(commentDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, commentDTO.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /comments/:id} : Partial updates given fields of an existing comment, field will ignore if it is null
     *
     * @param id the id of the commentDTO to save.
     * @param commentDTO the commentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated commentDTO,
     * or with status {@code 400 (Bad Request)} if the commentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the commentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the commentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CommentDTO> partialUpdateComment(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CommentDTO commentDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Comment partially : {}, {}", id, commentDTO);
        if (commentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, commentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!commentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CommentDTO> result = commentService.partialUpdate(commentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, commentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /comments} : get all the comments.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of comments in body.
     */
    @GetMapping("")
    public ResponseEntity<List<CommentDTO>> getAllComments(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        log.debug("REST request to get a page of Comments");
        Page<CommentDTO> page;
        if (eagerload) {
            page = commentService.findAllWithEagerRelationships(pageable);
        } else {
            page = commentService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/post/{id}")
    public ResponseEntity<List<CommentDTO>> getAllCommentsByPostId(@PathVariable("id") Long id) {
        log.debug("REST request to get list of Comments by post id");
        return ResponseEntity.ok().body(commentService.findAllByPostId(id));
    }

    /**
     * {@code GET  /comments/:id} : get the "id" comment.
     *
     * @param id the id of the commentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the commentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getComment(@PathVariable("id") Long id) {
        log.debug("REST request to get Comment : {}", id);
        Optional<CommentDTO> commentDTO = commentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(commentDTO);
    }

    /**
     * {@code DELETE  /comments/:id} : delete the "id" comment.
     *
     * @param id the id of the commentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id) {
        log.debug("REST request to delete Comment : {}", id);
        commentService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @DeleteMapping("/from-post/{id}")
    public ResponseEntity<?> deleteCommentFromPost(@PathVariable("id") Long id) {
        log.debug("REST request to delete Comment from post : {}", id);
        Optional<NotificationDTO> notificationOptional = commentService.deleteFromPost(id);

        if(notificationOptional.isPresent()) {
            return ResponseEntity.ok().body(null);
         }

         return ResponseEntity.badRequest().body(null);
    }
}
