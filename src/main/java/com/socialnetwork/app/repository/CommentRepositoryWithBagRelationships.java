package com.socialnetwork.app.repository;

import com.socialnetwork.app.domain.Comment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;

public interface CommentRepositoryWithBagRelationships {
    Optional<Comment> fetchBagRelationships(Optional<Comment> comment);

    List<Comment> fetchBagRelationships(List<Comment> comments);

    Page<Comment> fetchBagRelationships(Page<Comment> comments);
}
