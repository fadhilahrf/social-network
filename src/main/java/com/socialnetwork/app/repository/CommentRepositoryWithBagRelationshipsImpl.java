package com.socialnetwork.app.repository;

import com.socialnetwork.app.domain.Comment;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

/**
 * Utility repository to load bag relationships based on https://vladmihalcea.com/hibernate-multiplebagfetchexception/
 */
public class CommentRepositoryWithBagRelationshipsImpl implements CommentRepositoryWithBagRelationships {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<Comment> fetchBagRelationships(Optional<Comment> comment) {
        return comment.map(this::fetchLikes);
    }

    @Override
    public Page<Comment> fetchBagRelationships(Page<Comment> comments) {
        return new PageImpl<>(fetchBagRelationships(comments.getContent()), comments.getPageable(), comments.getTotalElements());
    }

    @Override
    public List<Comment> fetchBagRelationships(List<Comment> comments) {
        return Optional.of(comments).map(this::fetchLikes).orElse(Collections.emptyList());
    }

    Comment fetchLikes(Comment result) {
        return entityManager
            .createQuery("select comment from Comment comment left join fetch comment.likes where comment.id = :id", Comment.class)
            .setParameter("id", result.getId())
            .getSingleResult();
    }

    List<Comment> fetchLikes(List<Comment> comments) {
        HashMap<Object, Integer> order = new HashMap<>();
        IntStream.range(0, comments.size()).forEach(index -> order.put(comments.get(index).getId(), index));
        List<Comment> result = entityManager
            .createQuery("select comment from Comment comment left join fetch comment.likes where comment in :comments", Comment.class)
            .setParameter("comments", comments)
            .getResultList();
        Collections.sort(result, (o1, o2) -> Integer.compare(order.get(o1.getId()), order.get(o2.getId())));
        return result;
    }
}
