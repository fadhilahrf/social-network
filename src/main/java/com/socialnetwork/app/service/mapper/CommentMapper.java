package com.socialnetwork.app.service.mapper;

import com.socialnetwork.app.domain.Comment;
import com.socialnetwork.app.domain.Post;
import com.socialnetwork.app.domain.User;
import com.socialnetwork.app.service.dto.CommentDTO;
import com.socialnetwork.app.service.dto.PostDTO;
import com.socialnetwork.app.service.dto.UserDTO;
import java.util.Set;
import java.util.stream.Collectors;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Comment} and its DTO {@link CommentDTO}.
 */
@Mapper(componentModel = "spring")
public interface CommentMapper extends EntityMapper<CommentDTO, Comment> {
    @Mapping(target = "author", source = "author", qualifiedByName = "userLogin")
    @Mapping(target = "post", source = "post", qualifiedByName = "postId")
    CommentDTO toDto(Comment s);

    @Mapping(target = "removeLikes", ignore = true)
    Comment toEntity(CommentDTO commentDTO);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);

    @Named("userLoginSet")
    default Set<UserDTO> toDtoUserLoginSet(Set<User> user) {
        return user.stream().map(this::toDtoUserLogin).collect(Collectors.toSet());
    }

    @Named("postId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PostDTO toDtoPostId(Post post);
}
