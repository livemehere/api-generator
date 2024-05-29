import { ApiConfig } from "./src/type";

const config: ApiConfig = {
  path: "result/api",
  ignorePattern: ["**/HttpClient.ts", "**/useMutateUpdateCardEmoji.ts"],
  services: {
    Cem: {
      baseURL: "https://sandbox.api.nexon.com/fco-my-pitch/cem/my-pitch",
      headers: {
        Authorization: `Krpc <cookie>NPP</cookie>`,
      },
      apis: [
        {
          method: "GET",
          name: "getMyPitchMessages",
          path: "/messages",
          useInfiniteQuery: {
            initialPageParam: 1,
            pageKey: "page",
            getNextPageParam: "(lastPage) => lastPage.nextPage",
          },
          params: {
            page: 0,
          },
          response: {
            messages: "<raw>TMyPitchMessage[]</raw>",
            nextPage: "<raw>number | null</raw>",
          },
        },
        {
          method: "GET",
          useQuery: true,
          name: "getPlayReportSeasonList",
          path: "/seasons",
          response: {
            hasSeasonList: true,
            seasonList: `<raw>string[]|null</raw>`,
          },
        },
        {
          method: "GET",
          useQuery: true,
          name: "getWeeklyPlayReportHighlights",
          path: "/weekly-highlight",
          response: "<raw>ResponseGetWeeklyHighlight</raw>",
        },
        {
          method: "GET",
          useQuery: true,
          name: "getWeeklyPlayReportSummaries",
          path: "/weekly-play-report-summary",
          params: {
            matchType: "<raw>50|52</raw>",
          },
          response: {
            hasPreviousReports: true,
            currentReportSummary: [
              {
                nexonsn: 0,
                week_start_date: "Date",
                match_type: "<raw>50|52</raw>",
                type: `<raw>'WIN_RATE' | 'CNT_MATCH' | 'POSSESSION' | 'CLUB_VALUE'</raw>`,
                value: 0,
                trend: `<raw>'EQUAL'|'INCREASE'|'DECREASE'</raw>`, // 0:동일, 1:증가, 2:감소
              },
            ],
          },
        },
        {
          method: "GET",
          useQuery: true,
          name: "getWeeklyPlayReportData",
          path: "/weekly-play-report",
          params: {
            nexonsn: `<raw>number | undefined</raw>`,
            weekStartDate: "Date",
            grade: `<raw>number|undefined</raw>`,
            matchType: `<raw>50|52</raw>`,
          },
          response: {
            nexonsn: `<raw>number | undefined</raw>`,
            week_start_date: "Date",
            cnt_match: `<raw>number|undefined</raw>`,
            match_type: `<raw>50|52</raw>`,
            win_rate: 0, // 승률
            avg_match: 0, // 평균 경기수
            avg_effshoot: 0, // 유효슛
            avg_score: 0, // 득점
            avg_oppscore: 0, // 실점
            avg_passsuccessrate: 0,
            avg_possession: 0, // 점유율
            avg_clubvalue: 0, // 구단가치
            grade: `<raw>number|undefined</raw>`,
            grade_name: `<raw>string|undefined</raw>`,
          },
        },
        {
          method: "GET",
          useQuery: true,
          path: "/season-analysis",
          name: "getSeasonAnalysis",
          params: {
            seasonId: `<raw>string|number</raw>`, // YYYYMM
            matchType: `<raw>50|52</raw>`,
          },
          response: {
            date: "",
            nexonsn: 0,
            season_id: "YYYYMM",
            match_type: `<raw>50|52</raw>`,
            type: `<raw>'TOP_RANK_COMPARE' | 'PREV_RANK_COMPARE' | 'CURR_SEASON_SUMMARY_VS_PREV_SEASON' | 'CURR_SEASON_SUMMARY_VS_ALL_USER'</raw>`,
            body_a: "JSON",
            body_b: "JSON",
          },
        },
        {
          method: "GET",
          useQuery: true,
          path: "/season-summary",
          name: "getSeasonSummary",
          params: {
            seasonId: `<raw>string|number</raw>`, // YYYYMM
            matchType: `<raw>50|52</raw>`,
          },
          response: {
            nexonsn: 0,
            season_id: 0,
            match_type: `<raw>50|52</raw>`,
            last_grade: 0,
            last_grade_name: "",
            teamcolor: 0,
            teamcolor_url: "",
            teamcolor_name: "",
            teamcolor_level: 0,
            cnt_win: 0,
            cnt_draw: 0,
            cnt_lose: 0,
            total_score: 0,
            total_oppscore: 0,
          },
        },
      ],
    },
    Yf: {
      baseURL: "https://sandbox.api.nexon.com/fco-my-pitch/yourfield/api",
      headers: {
        Authorization: `Krpc <cookie>NPP</cookie>`,
        "x-api-key": "my-pitch",
      },
      apis: [
        {
          method: "GET",
          useQuery: true,
          name: "getNickname",
          path: "/user/nickname",
          params: {
            nexonsn: 0,
          },
          response: {
            nexonsn: 0,
            nickname: "",
          },
        },
        {
          method: "GET",
          useQuery: true,
          name: "getFriendList",
          path: "/of/friend",
          params: {
            nexonsn: 0,
          },
          response: [
            {
              nexonsn: 0,
            },
          ],
        },
        {
          method: "GET",
          useQuery: true,
          name: "getUserSeasonInfo",
          path: "/of/season",
          params: {
            nexonsn: 0,
          },
          response: {
            clubLogoPath: "",
            rankIconPath: "",
            clubValue: 0,
            nickName: "",
            rankName: "",
            win: 0,
            draw: 0,
            lose: 0,
          },
        },
        {
          method: "GET",
          useInfiniteQuery: {
            defaultTopScript: `
                            import { SOCIAL_CARDS_QUERY_KEY } from '@my-pitch/src/queries-utils/socialCards';
                        `,
            pageKey: "page",
            queryKey: "[SOCIAL_CARDS_QUERY_KEY, params.nexonsn]",
            initialPageParam: 0,
            getNextPageParam:
              "(lastPage, allPages) => (lastPage.hasNext ? allPages.length : undefined)",
          },
          name: "getSocialCards",
          path: "/of/socialcard/list",
          params: { page: 0, size: 0, nexonsn: 0 },
          response: {
            hasNext: true,
            socialCardDtos: `<raw>TSocialCard[]</raw>`,
          },
        },
        {
          method: "POST",
          name: "updateCardEmoji",
          path: "of/socialcard/emoji",
          useMutation: {
            invalidateApiName: "getSocialCards",
          },
          params: {
            nexonsn: 0,
            cardId: 0,
            emoji: `<raw>EmojiEnum</raw>`,
            isInsert: `<raw>0|1</raw>`,
          },
          response: `<raw>'SUCCESS'</raw>`,
        },
      ],
    },
  },
};

export default config;
