import HttpClient from "./HttpClient";

export type TGetMyPitchMessagesParams = {
  page: number;
};
export type TGetMyPitchMessagesResponse = {
  messages: TMyPitchMessage[];
  nextPage: number | null;
};
export type TGetPlayReportSeasonListResponse = {
  hasSeasonList: boolean;
  seasonList: string[] | null;
};
export type TGetWeeklyPlayReportHighlightsResponse = ResponseGetWeeklyHighlight;
export type TGetWeeklyPlayReportSummariesParams = {
  matchType: 50 | 52;
};
export type TGetWeeklyPlayReportSummariesResponse = {
  hasPreviousReports: boolean;
  currentReportSummary: CurrentReportSummary[];
};
export type CurrentReportSummary = {
  nexonsn: number;
  week_start_date: string;
  value: number;
  match_type: 50 | 52;
  type: "WIN_RATE" | "CNT_MATCH" | "POSSESSION" | "CLUB_VALUE";
  trend: "EQUAL" | "INCREASE" | "DECREASE";
};
export type TGetWeeklyPlayReportDataParams = {
  weekStartDate: string;
  nexonsn?: number;
  grade?: number;
  matchType: 50 | 52;
};
export type TGetWeeklyPlayReportDataResponse = {
  week_start_date: string;
  win_rate: number;
  avg_match: number;
  avg_effshoot: number;
  avg_score: number;
  avg_oppscore: number;
  avg_passsuccessrate: number;
  avg_possession: number;
  avg_clubvalue: number;
  nexonsn?: number;
  cnt_match?: number;
  match_type: 50 | 52;
  grade?: number;
  grade_name?: string;
};
export type TGetSeasonAnalysisParams = {
  seasonId: string | number;
  matchType: 50 | 52;
};
export type TGetSeasonAnalysisResponse = {
  date: string;
  nexonsn: number;
  season_id: string;
  body_a: string;
  body_b: string;
  match_type: 50 | 52;
  type:
    | "TOP_RANK_COMPARE"
    | "PREV_RANK_COMPARE"
    | "CURR_SEASON_SUMMARY_VS_PREV_SEASON"
    | "CURR_SEASON_SUMMARY_VS_ALL_USER";
};
export type TGetSeasonSummaryParams = {
  seasonId: string | number;
  matchType: 50 | 52;
};
export type TGetSeasonSummaryResponse = {
  nexonsn: number;
  season_id: number;
  last_grade: number;
  last_grade_name: string;
  teamcolor: number;
  teamcolor_url: string;
  teamcolor_name: string;
  teamcolor_level: number;
  cnt_win: number;
  cnt_draw: number;
  cnt_lose: number;
  total_score: number;
  total_oppscore: number;
  match_type: 50 | 52;
};
class CemService {
  private httpClient: HttpClient = new HttpClient({
    baseURL: "https://sandbox.api.nexon.com/fco-my-pitch/cem/my-pitch",
    requestHook: (config) => {
      config.headers["Authorization"] =
        `Krpc ${HttpClient.getFromCookie("NPP")}`;
      return config;
    },
  });

  async getMyPitchMessages(params: TGetMyPitchMessagesParams) {
    return this.httpClient.get<TGetMyPitchMessagesResponse>(
      "/messages",
      params,
    );
  }
  async getPlayReportSeasonList() {
    return this.httpClient.get<TGetPlayReportSeasonListResponse>("/seasons");
  }
  async getWeeklyPlayReportHighlights() {
    return this.httpClient.get<TGetWeeklyPlayReportHighlightsResponse>(
      "/weekly-highlight",
    );
  }
  async getWeeklyPlayReportSummaries(
    params: TGetWeeklyPlayReportSummariesParams,
  ) {
    return this.httpClient.get<TGetWeeklyPlayReportSummariesResponse>(
      "/weekly-play-report-summary",
      params,
    );
  }
  async getWeeklyPlayReportData(params: TGetWeeklyPlayReportDataParams) {
    return this.httpClient.get<TGetWeeklyPlayReportDataResponse>(
      "/weekly-play-report",
      params,
    );
  }
  async getSeasonAnalysis(params: TGetSeasonAnalysisParams) {
    return this.httpClient.get<TGetSeasonAnalysisResponse>(
      "/season-analysis",
      params,
    );
  }
  async getSeasonSummary(params: TGetSeasonSummaryParams) {
    return this.httpClient.get<TGetSeasonSummaryResponse>(
      "/season-summary",
      params,
    );
  }
}
export const cemService = new CemService();
