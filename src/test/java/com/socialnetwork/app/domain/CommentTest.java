package com.socialnetwork.app.domain;

import static com.socialnetwork.app.domain.CommentTestSamples.*;
import static com.socialnetwork.app.domain.PostTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.socialnetwork.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CommentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Comment.class);
        Comment comment1 = getCommentSample1();
        Comment comment2 = new Comment();
        assertThat(comment1).isNotEqualTo(comment2);

        comment2.setId(comment1.getId());
        assertThat(comment1).isEqualTo(comment2);

        comment2 = getCommentSample2();
        assertThat(comment1).isNotEqualTo(comment2);
    }

    @Test
    void postTest() throws Exception {
        Comment comment = getCommentRandomSampleGenerator();
        Post postBack = getPostRandomSampleGenerator();

        comment.setPost(postBack);
        assertThat(comment.getPost()).isEqualTo(postBack);

        comment.post(null);
        assertThat(comment.getPost()).isNull();
    }
}
