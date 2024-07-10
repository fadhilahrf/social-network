package com.socialnetwork.app.web.rest;

import com.socialnetwork.app.service.UserService;
import com.socialnetwork.app.service.dto.NotificationDTO;
import com.socialnetwork.app.service.dto.UserDTO;
import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

@RestController
@RequestMapping("/api/public")
public class PublicUserResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = Collections.unmodifiableList(
        Arrays.asList("id", "login", "firstName", "lastName", "email", "activated", "langKey")
    );

    private final Logger log = LoggerFactory.getLogger(PublicUserResource.class);

    private final UserService userService;

    private final SimpMessagingTemplate messagingTemplate;

    public PublicUserResource(UserService userService, SimpMessagingTemplate messagingTemplate) {
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * {@code GET /users} : get all users with only public information - calling this method is allowed for anyone.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body all users.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllPublicUsers(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get all public User names");
        if (!onlyContainsAllowedProperties(pageable)) {
            return ResponseEntity.badRequest().build();
        }

        final Page<UserDTO> page = userService.getAllPublicUsers(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    private boolean onlyContainsAllowedProperties(Pageable pageable) {
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }

    /**
     * Gets a list of all roles.
     * @return a string list of all roles.
     */
    @GetMapping("/authorities")
    public List<String> getAuthorities() {
        return userService.getAuthorities();
    }

    @GetMapping("/users/{login}")
    public ResponseEntity<UserDTO> getPublicUserByLogin(@PathVariable("login") String login) {
        return ResponseEntity.ok().body(userService.getPublicUserByLogin(login));
    }

    @GetMapping("/users/followers/{login}")
    public ResponseEntity<List<UserDTO>> getFollowersByUserLogin(@PathVariable("login") String login) {
        return ResponseEntity.ok().body(userService.getFollowersByUserLogin(login));
    }

    @GetMapping("/users/following/{login}")
    public ResponseEntity<List<UserDTO>> findFollowingByUserLogin(@PathVariable("login") String login) {
        return ResponseEntity.ok().body(userService.findFollowingByUserLogin(login));
    }

    @PostMapping("/user/follow/{login}") 
    public void followUser(@PathVariable("login") String login) {
        Optional<NotificationDTO> notificationOptional = userService.followUser(login);

        if(notificationOptional.isPresent()) {
            messagingTemplate.convertAndSendToUser(
                notificationOptional.get().getReceiver().getLogin(), "/notification",
                notificationOptional.get()
            );
        }
    }

    @PostMapping("/user/unfollow/{login}") 
    public ResponseEntity<?>  unfollowUser(@PathVariable("login") String login) {
        Optional<NotificationDTO> notificationOptional = userService.unfollowUser(login);

        if(notificationOptional.isPresent()) {
            return ResponseEntity.ok().body(null);
         }

         return ResponseEntity.badRequest().body(null);
    }
}
