package com.socialnetwork.app.service.mapper;

import com.socialnetwork.app.domain.Notification;
import com.socialnetwork.app.domain.User;
import com.socialnetwork.app.service.dto.NotificationDTO;
import com.socialnetwork.app.service.dto.UserDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Notification} and its DTO {@link NotificationDTO}.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper extends EntityMapper<NotificationDTO, Notification> {
    @Mapping(target = "sender", source = "sender", qualifiedByName = "userLogin")
    @Mapping(target = "receiver", source = "receiver", qualifiedByName = "userLogin")
    NotificationDTO toDto(Notification s);

    @Named("userLogin")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "login", source = "login")
    UserDTO toDtoUserLogin(User user);
}
