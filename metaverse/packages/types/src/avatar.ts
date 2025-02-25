export interface Avatar {
  avatarId: string;
  name: string;
  imageUrl: string;
  createdBy: string;
}

export interface CreateAvatarRequest {
  name: string;
  imageUrl: string;
}

export interface UpdateMetadataRequest {
  avatarId: string;
}
