package com.example.Kakeibo.domain.group;

import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
public class GroupMemberId implements Serializable {

    private Long groupId;
    private Long userId;
}
