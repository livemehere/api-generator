import HttpClient from "./HttpClient";

export type TGetNicknameParams = {
  nexonsn: number;
};
export type TGetNicknameResponse = {
  nexonsn: number;
  nickname: string;
};
export type TGetFriendListParams = {
  nexonsn: number;
};
export type TGetFriendListResponse = {
  nexonsn: number;
}[];
export type TGetUserSeasonInfoParams = {
  nexonsn: number;
};
export type TGetUserSeasonInfoResponse = {
  clubLogoPath: string;
  rankIconPath: string;
  clubValue: number;
  nickName: string;
  rankName: string;
  win: number;
  draw: number;
  lose: number;
};
export type TGetSocialCardsParams = {
  page: number;
  size: number;
  nexonsn: number;
};
export type TGetSocialCardsResponse = {
  hasNext: boolean;
  socialCardDtos: TSocialCard[];
};
export type TUpdateCardEmojiParams = {
  nexonsn: number;
  cardId: number;
  emoji: EmojiEnum;
  isInsert: 0 | 1;
};
export type TUpdateCardEmojiResponse = "SUCCESS";
class YfService {
  private httpClient: HttpClient = new HttpClient({
    baseURL: "https://sandbox.api.nexon.com/fco-my-pitch/yourfield/api",
    requestHook: (config) => {
      config.headers["Authorization"] =
        `Krpc ${HttpClient.getFromCookie("NPP")}`;
      config.headers["x-api-key"] = "my-pitch";
      return config;
    },
  });

  async getNickname(params: TGetNicknameParams) {
    return this.httpClient.get<TGetNicknameResponse>("/user/nickname", params);
  }
  async getFriendList(params: TGetFriendListParams) {
    return this.httpClient.get<TGetFriendListResponse>("/of/friend", params);
  }
  async getUserSeasonInfo(params: TGetUserSeasonInfoParams) {
    return this.httpClient.get<TGetUserSeasonInfoResponse>(
      "/of/season",
      params,
    );
  }
  async getSocialCards(params: TGetSocialCardsParams) {
    return this.httpClient.get<TGetSocialCardsResponse>(
      "/of/socialcard/list",
      params,
    );
  }
  async updateCardEmoji(params: TUpdateCardEmojiParams) {
    return this.httpClient.post<TUpdateCardEmojiResponse>(
      "of/socialcard/emoji",
      null,
      params,
    );
  }
}
export const yfService = new YfService();
