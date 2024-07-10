package com.socialnetwork.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * A Post.
 */
@Entity
@Table(name = "post")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Post extends AbstractAuditingEntity<Long> {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @NotNull
    @Column(name = "content", nullable = false)
    private String content;

    @Min(value = 0)
    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Min(value = 0)
    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "rel_post__likes",
        joinColumns = @JoinColumn(name = "post_id"), 
        inverseJoinColumns = @JoinColumn(name = "user_id"))
    @JsonIgnoreProperties(value = { "followers", "followings" }, allowSetters = true)
    private Set<User> likes = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Post id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public User getAuthor() {
        return author;
    }

    public Post author(User author) {
        this.setAuthor(author);
        return this;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public String getContent() {
        return this.content;
    }

    public Post content(String content) {
        this.setContent(content);
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getLikeCount() {
        return this.likeCount;
    }

    public Post likeCount(Integer likeCount) {
        this.setLikeCount(likeCount);
        return this;
    }

    public void setLikeCount(Integer likeCount) {
        this.likeCount = likeCount;
    }

    public Integer getCommentCount() {
        return this.commentCount;
    }

    public Post commentCount(Integer commentCount) {
        this.setCommentCount(commentCount);
        return this;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    public Set<User> getLikes() {
        return this.likes;
    }

    public void setLikes(Set<User> users) {
        this.likes = users;
    }

    public Post likes(Set<User> users) {
        this.setLikes(users);
        return this;
    }

    public Post addLikes(User user) {
        this.likes.add(user);
        return this;
    }

    public Post removeLikes(User user) {
        this.likes.remove(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Post)) {
            return false;
        }
        return getId() != null && getId().equals(((Post) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Post{" +
            "id=" + getId() +
            ", content='" + getContent() + "'" +
            ", likeCount=" + getLikeCount() +
            ", commentCount=" + getCommentCount() +
            "}";
    }
}
