package com.socialnetwork.app.repository;

import com.socialnetwork.app.domain.Post;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Post entity.
 *
 * When extending this class, extend PostRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface PostRepository extends PostRepositoryWithBagRelationships, JpaRepository<Post, Long> {
    default Optional<Post> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findById(id));
    }

    default List<Post> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAll());
    }

    default Page<Post> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAll(pageable));
    }

    public List<Post> findAllByAuthorIdOrderByCreatedDateDesc(Long id);

    public List<Post> findAllByAuthorIdOrderByCreatedDateDesc(Long id, Pageable pageable);

    default List<Post> findAllByAuthorIdOrderByCreatedDateDescWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findAllByAuthorIdOrderByCreatedDateDesc(id));
    }

    default List<Post> findAllByAuthorIdOrderByCreatedDateDescWithEagerRelationshipsLimit(Long id, Pageable pageable) {
        return this.fetchBagRelationships(this.findAllByAuthorIdOrderByCreatedDateDesc(id, pageable));
    }

    public List<Post> findAllByOrderByCreatedDateDesc();

    public List<Post> findAllByOrderByCreatedDateDesc(Pageable pageable);

    public Integer countByAuthorId(Long id);
}
