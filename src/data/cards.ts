import type { NetworkCard } from "@/types";
import {
  CASPIAN_STRIKE,
  IRAN_STRIKE_SITES,
  RU_ON_UA_SITES,
  UA_ON_OCCUPIED_SITES,
  UA_ON_RU_SITES,
  sitesToFireLayers,
} from "@/data/warSites";

export const cards: NetworkCard[] = [
  {
    id: "c1",
    name: "러시아·이란·북한 드론·무기 네트워크",
    summary:
      "이란이 드론 기술을 넘기고, 러시아가 대량 생산해 우크라이나를 때리고, 북한이 탄약과 인력을 대며 전쟁을 떠받치는 구조.",
    triggers: [
      "샤헤드",
      "게란",
      "옐라부가",
      "북한 파병",
      "KN-23",
      "러북 조약",
    ],
    doNotAssert: [
      "북한-이란 직접 군사거래를 확인된 사실로 쓰지 않는다",
      "생산량·병력 숫자를 하나로 단정하지 않는다",
    ],
    marketTouchpoints: ["방산", "드론 부품 공급망"],
    relatedCardIds: ["c2", "c7", "c3"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 55.76, lng: 52.05, label: "옐라부가" },
      { lat: 35.7, lng: 51.4, label: "이란" },
      { lat: 39.0, lng: 125.8, label: "평양" },
    ],
    claims: [
      {
        id: "c1-shahed",
        text: "이란→러시아: 샤헤드형 드론 공급과 옐라부가 공장 지원으로 러시아가 게란-2를 직접 생산한다",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "csis-nk-ru",
            label: "CSIS Beyond Parallel",
            url: "https://beyondparallel.csis.org/north-korea-russia-cooperation/",
          },
        ],
        caveat: "생산량 수치는 출처마다 달라 하나로 단정하지 않는다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 45, lng: 50, altitude: 1.8 },
          layers: [
            {
              type: "arc",
              label: "이란→러시아 드론 기술",
              tag: "확립",
              from: [51.4, 35.7],
              to: [52.05, 55.76],
            },
            {
              type: "point",
              label: "옐라부가",
              tag: "확립",
              at: [52.052, 55.788],
              marker: "fire",
            },
            {
              type: "point",
              label: "테헤란",
              tag: "확립",
              at: [51.4, 35.7],
            },
            {
              type: "arc",
              label: "게란→우크라이나",
              tag: "확립",
              from: [52.052, 55.788],
              to: [30.523, 50.45],
            },
            {
              type: "point",
              label: "키이우",
              tag: "확립",
              at: [30.523, 50.45],
              marker: "fire",
            },
          ],
          callouts: [
            {
              anchor: [52.052, 55.788],
              title: "옐라부가 공장",
              tag: "확립",
              note: "게란-2 생산 거점. 생산량 추정치는 출처마다 다름",
            },
          ],
        },
      },
      {
        id: "c1-nk-supply",
        text: "북한→러시아: 포탄·탄도미사일(KN-23·24)·병력. 2024년 6월 포괄적 전략동반자 조약이 근거",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "chatham-nk",
            label: "Chatham House",
            url: "https://www.chathamhouse.org/2026/09/north-koreas-military-partnership-russia-has-consequences-far-beyond-ukraine",
          },
        ],
        counterClaim: "포탄·병력 규모 추정치는 출처마다 크게 다르다",
        caveat: "수치는 추정으로만 표기한다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 48, lng: 130, altitude: 1.6 },
          layers: [
            {
              type: "arc",
              label: "북한→러시아 물자·병력",
              tag: "확립",
              from: [125.8, 39.0],
              to: [37.6, 55.75],
            },
            {
              type: "point",
              label: "두만강-하산",
              tag: "추정",
              at: [130.6, 42.4],
            },
            {
              type: "point",
              label: "쿠르스크 전선",
              tag: "보도",
              at: [36.2, 51.7],
            },
          ],
          callouts: [
            {
              anchor: [130.6, 42.4],
              title: "두만강-하산 철도",
              tag: "추정",
              note: "북한-러시아 육로 연결로 추정되는 핵심 지점",
            },
          ],
        },
      },
      {
        id: "c1-nk-workers",
        text: "북한 노동자의 옐라부가 투입: 최대 1만 2천 명 모집 보도",
        tag: "보도",
        grade: "C",
        sources: [{ id: "press-elabuga", label: "다수 매체 보도" }],
        caveat: "모집·투입 규모는 확인되지 않은 보도다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 55.76, lng: 52.05, altitude: 1.2 },
          layers: [
            {
              type: "arc",
              label: "노동자→옐라부가 (점선)",
              tag: "보도",
              from: [125.8, 39.0],
              to: [52.05, 55.76],
            },
            {
              type: "point",
              label: "옐라부가",
              tag: "보도",
              at: [52.05, 55.76],
            },
          ],
          callouts: [
            {
              anchor: [52.05, 55.76],
              title: "노동자 투입 보도",
              tag: "보도",
              note: "규모는 단정하지 않는다",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c2",
    name: "카스피해·INSTC 교역망",
    summary:
      "서방 해군이 들어갈 수 없는 내해와 북남 회랑(INSTC)이 러시아-이란 교역과 군수품 이동로가 됐고, 벨라루스도 이 교역망에 올라탔다.",
    triggers: [
      "카스피해",
      "INSTC",
      "북남 회랑",
      "아미라바드",
      "반다르안잘리",
      "아스트라한",
      "마하치칼라",
      "라슈트-아스타라",
    ],
    doNotAssert: [
      "화물의 내용을 단정하지 않는다",
      "벨라루스-이란 군사협력을 무기 이전으로 확대하지 않는다",
      "물동량 전망을 실적처럼 쓰지 않는다",
    ],
    marketTouchpoints: ["해운", "물류", "에너지 교역"],
    relatedCardIds: ["c1", "c5", "c7"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 42.0, lng: 50.5, label: "카스피해" },
      { lat: 46.35, lng: 48.03, label: "아스트라한" },
      { lat: 37.47, lng: 49.46, label: "엔젤리" },
    ],
    claims: [
      {
        id: "c2-instc",
        text: "INSTC: 인도양·페르시아만에서 이란과 카스피해를 거쳐 러시아로 이어지는 다중 경로 회랑",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "adb-instc",
            label: "ADB ARIC",
            url: "https://aric.adb.org/initiative/international-north-south-transport-corridor",
          },
        ],
        caveat: "라슈트-아스타라 철도는 건설 중이며 잠재력을 과대평가하지 않는다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 40, lng: 52, altitude: 1.5 },
          layers: [
            {
              type: "line",
              label: "트랜스카스피 중앙 경로",
              tag: "보도",
              path: [
                [48.03, 46.35],
                [49.5, 42.0],
                [49.46, 37.47],
              ],
            },
            {
              type: "point",
              label: "아스트라한",
              tag: "확립",
              at: [48.03, 46.35],
            },
            {
              type: "point",
              label: "마하치칼라",
              tag: "확립",
              at: [47.5, 42.98],
            },
            {
              type: "point",
              label: "엔젤리",
              tag: "확립",
              at: [49.46, 37.47],
            },
            {
              type: "point",
              label: "아미라바드",
              tag: "보도",
              at: [53.25, 36.85],
            },
          ],
          callouts: [
            {
              anchor: [50.5, 42.0],
              title: "카스피해 내해",
              tag: "확립",
              note: "2018년 협약으로 역외 국가 군함 활동이 제한된다",
            },
          ],
        },
      },
      {
        id: "c2-munitions",
        text: "러시아→이란 군수: 드론 부품·탄약·TNT를 선박이 아미라바드항으로 옮겼다는 NBC 보도",
        tag: "보도",
        grade: "C",
        sources: [
          {
            id: "nbc-caspian",
            label: "NBC (재인용)",
            url: "https://easternherald.com/2026/08/18/russia-iran-explosives-drones-caspian-sea-iran-war/",
          },
        ],
        counterClaim: "화물 성격은 당사자 주장이 상충할 수 있다",
        caveat: "화물 내용을 단정하지 않는다",
        scene: {
          asOf: "2026-08-18",
          camera: { lat: 40, lng: 51, altitude: 1.4 },
          layers: [
            {
              type: "arc",
              label: "러→이란 수송 보도",
              tag: "보도",
              from: [48.03, 46.35],
              to: [53.25, 36.85],
            },
            {
              type: "point",
              label: "아미라바드",
              tag: "보도",
              at: [53.25, 36.85],
            },
          ],
          callouts: [
            {
              anchor: [53.25, 36.85],
              title: "아미라바드항",
              tag: "보도",
              note: "유럽 정부 문서·서방 당국자 확인을 인용한 보도",
            },
          ],
        },
      },
      {
        id: "c2-anzali-strike",
        text: "이스라엘의 반다르안잘리항 공습(2026년 3월): 러시아 군수품 수송 차단이 목적이라는 이스라엘 측 설명",
        tag: "보도",
        grade: "C",
        sources: [
          {
            id: "rferl-anzali",
            label: "RFE/RL",
            url: "https://www.rferl.org/a/israel-hits-the-caspian-sea-port/33718210.html",
          },
        ],
        counterClaim: "목적 설명은 이스라엘 측 주장이다",
        caveat: "공습 목적과 화물 성격을 사실처럼 쓰지 않는다",
        scene: {
          asOf: "2026-03",
          camera: { lat: 37.47, lng: 49.46, altitude: 1.1 },
          layers: [
            {
              type: "point",
              label: "반다르안잘리",
              tag: "보도",
              at: [49.46, 37.47],
            },
          ],
          callouts: [
            {
              anchor: [49.46, 37.47],
              title: "2026-03 공습",
              tag: "보도",
              note: "이스라엘 측 목적 설명은 당사자 주장으로 구분",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c3",
    name: "러우전과 중동전의 연결",
    summary:
      "러시아는 우크라이나 도시·전력을 때리고, 우크라이나는 러시아 정유·드론공장·점령지 유류시설을 줄기차게 폭격한다. 2026-07 카스피해 볼가 하구에서 이란 선박까지 타격한 보도가 ‘하나의 전선’을 보여 준다. 지도의 주황 구역은 러 점령지(DeepState 기반).",
    triggers: [
      "샤헤드",
      "게란",
      "러우전",
      "정유 폭격",
      "카스피해",
      "점령지",
      "러-이란 협력",
      "딥스트라이크",
    ],
    doNotAssert: [
      "러시아가 이란전에 직접 참전했다고 쓰지 않는다",
      "이스파한 HESA 공습을 우크라이나 소행으로 쓰지 않는다(미·이스라엘 작전으로 보도)",
      "점령선은 단순화·시점 고정이며 실시간 전선이 아니다",
    ],
    marketTouchpoints: ["원유", "방산", "해상 운임·보험"],
    relatedCardIds: ["c1", "c5", "c2"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 50.45, lng: 30.523, label: "키이우" },
      { lat: 55.788, lng: 52.052, label: "옐라부가" },
      { lat: 45.85, lng: 48.55, label: "카스피해·볼가 하구" },
      { lat: 33.725, lng: 51.726, label: "나타즈" },
      { lat: 45.049, lng: 35.379, label: "페오도시야(점령)" },
    ],
    claims: [
      {
        id: "c3-ru-attacks-ua",
        text: "러시아→우크라이나: 키이우·하르키우·드니프로·자포리자 시 등 도시·전력에 드론·미사일 반복 타격 (BBC·Reuters·DiXi 등)",
        tag: "확립",
        grade: "A",
        sources: [
          {
            id: "dixi-energy",
            label: "DiXi Group / NV",
            url: "https://english.nv.ua/nation/four-campaigns-of-attacks-on-ukraine-s-power-grid-analysts-reveal-logic-behind-russian-strikes-50586889.html",
          },
          {
            id: "bbc-kyiv-power",
            label: "BBC",
            url: "https://www.bbc.com/news/articles/cvgq2vnxzlvo",
          },
          {
            id: "reuters-ua-energy-2025",
            label: "Reuters",
            url: "https://www.reuters.com/world/europe/russia-hits-several-key-ukraine-energy-facilities-kills-three-people-2025-11-08/",
          },
        ],
        caveat: "폭발 마커는 보도된 도시·권역 중심. 개별 시설 GPS는 공개 보도 범위만",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 49.0, lng: 33.5, altitude: 1.25 },
          layers: [
            {
              type: "arc",
              label: "러시아→우크라이나 공습",
              tag: "확립",
              from: [37.6, 55.75],
              to: [30.523, 50.45],
            },
            ...sitesToFireLayers(RU_ON_UA_SITES),
          ],
          callouts: [
            {
              anchor: [30.523, 50.45],
              title: "도시·전력 타격",
              tag: "확립",
              note: "주황 구역 = 러 점령지. 자포리자 시는 우크 통제, 에네르호다르·남부는 점령",
            },
          ],
        },
      },
      {
        id: "c3-ua-strikes-ru",
        text: "우크라이나→러시아: 랴잔·볼고그라드·사라토프·시즈란·투압세·옐라부가 등 정유·드론공장 반복 딥스트라이크 + 점령 크림 페오도시야 터미널",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "reuters-ru-refineries",
            label: "Reuters (정유 타격 목록)",
            url: "https://www.reuters.com/world/europe/russian-energy-facilities-targeted-by-ukraines-drones-2025-03-19/",
          },
          {
            id: "reuters-moscow-refinery-2026",
            label: "Reuters (모스크바 정유 2026-09)",
            url: "https://www.reuters.com/world/europe/two-dead-moscow-region-drones-hit-oil-refinery-russian-capital-2026-09-20/",
          },
          {
            id: "ap-yelabuga-2024",
            label: "AP (옐라부가 2024-04)",
            url: "https://apnews.com/article/ukraine-russia-war-drones-b2299c10adfde656dbec6b7223598bbc",
          },
        ],
        caveat: "시설별 피해·가동 중단은 출처마다 다름. 마커는 공개 보도된 시설명 위치",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 52.5, lng: 42, altitude: 1.5 },
          layers: [
            {
              type: "arc",
              label: "우크→러 딥스트라이크",
              tag: "확립",
              from: [30.523, 50.45],
              to: [39.696, 54.629],
            },
            ...sitesToFireLayers(UA_ON_RU_SITES),
            ...sitesToFireLayers(UA_ON_OCCUPIED_SITES),
          ],
          callouts: [
            {
              anchor: [52.052, 55.788],
              title: "옐라부가(게란)",
              tag: "확립",
              note: "이란 설계 샤헤드 러시아 양산. 2024-04·2025 타격 보도",
            },
            {
              anchor: [35.379, 45.049],
              title: "점령 크림 페오도시야",
              tag: "보도",
              note: "점령지 유류 터미널 화재 보도 — 주황 구역 안",
            },
          ],
        },
      },
      {
        id: "c3-ua-iran-front",
        text: "하나의 전선: 2026-07-25 카스피해 볼가 하구(~아스트라한)에서 이란 선박 Anna 등 타격(BBC·로이터). 이스파한 본토 공습은 미·이스라엘 — 우크 소행 아님",
        tag: "보도",
        grade: "B",
        sources: [
          {
            id: "bbc-caspian-iran-ship",
            label: "BBC",
            url: "https://www.bbc.com/news/articles/cwyj7yl0xndo",
          },
          {
            id: "reuters-caspian-iran",
            label: "Reuters",
            url: "https://www.reuters.com/world/europe/iran-says-ukrainian-attack-vessel-caspian-sea-killed-sailor-2026-07-25/",
          },
          {
            id: "kyivpost-zelensky-iran",
            label: "Kyiv Post",
            url: "https://www.kyivpost.com/post/81139",
          },
        ],
        counterClaim: "이란은 민간 화물·비개입 주장. 선박 성격은 당사자마다 다름",
        caveat: "폭발 마커는 볼가 하구 정박 위치(이란 대사 발언: 하구 ~5km). 이스파한에는 우크 타격 마커를 두지 않음",
        scene: {
          asOf: "2026-07-25",
          camera: { lat: 46.5, lng: 48, altitude: 1.55 },
          layers: [
            {
              type: "arc",
              label: "이란→러시아 샤헤드",
              tag: "확립",
              from: [51.55, 32.85],
              to: [52.052, 55.788],
            },
            {
              type: "arc",
              label: "우크→카스피해 타격",
              tag: "보도",
              from: [30.523, 50.45],
              to: CASPIAN_STRIKE.at,
            },
            ...sitesToFireLayers([CASPIAN_STRIKE]),
            ...sitesToFireLayers(
              UA_ON_RU_SITES.filter((s) => s.id === "yelabuga"),
            ),
            ...sitesToFireLayers(
              IRAN_STRIKE_SITES.filter((s) => s.id === "isfahan-hesa"),
            ),
          ],
          callouts: [
            {
              anchor: CASPIAN_STRIKE.at,
              title: "볼가 하구 타격",
              tag: "보도",
              note: CASPIAN_STRIKE.note,
            },
          ],
        },
      },
      {
        id: "c3-tech-cycle",
        text: "기술의 순환: 이란 샤헤드→러시아 게란→개량형이 이란으로 돌아간다는 분석",
        tag: "분석",
        grade: "D",
        sources: [
          {
            id: "atlantic-two-wars",
            label: "Atlantic Council",
            url: "https://www.atlanticcouncil.org/dispatches/russia-and-iran-are-linking-the-wars-in-ukraine-and-the-middle-east/",
          },
        ],
        counterClaim: "일부는 젤렌스키 발언 등 당사자 주장에 기댄다",
        caveat: "순환을 확립된 사실처럼 쓰지 않는다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 42, lng: 48, altitude: 1.7 },
          layers: [
            {
              type: "arc",
              label: "이란→러시아",
              tag: "분석",
              from: [51.4, 35.7],
              to: [52.052, 55.788],
            },
            {
              type: "arc",
              label: "러시아→이란 (추정)",
              tag: "추정",
              from: [52.052, 55.788],
              to: [51.4, 35.7],
            },
            ...sitesToFireLayers(
              UA_ON_RU_SITES.filter((s) => s.id === "yelabuga"),
            ),
            ...sitesToFireLayers(
              IRAN_STRIKE_SITES.filter((s) => s.id === "isfahan-hesa"),
            ),
          ],
          callouts: [
            {
              anchor: [45, 42],
              title: "기술 순환 (분석)",
              tag: "분석",
              note: "두 전쟁을 잇는 공급망 가설",
            },
          ],
        },
      },
      {
        id: "c3-iran-war",
        text: "이란전: 미국·이스라엘이 나타즈·포르도·이스파한(핵단지·HESA) 등 이란 본토를 타격했다는 보도 — 우크라이나 타격과 별개",
        tag: "보도",
        grade: "B",
        sources: [
          {
            id: "ap-iran-nuclear-damage",
            label: "AP",
            url: "https://apnews.com/article/mideast-wars-iran-satellite-photos-nuclear-sites-us-da82442dd4d526e69a4f1e77a72f3dfd",
          },
          {
            id: "reuters-natanz-2026",
            label: "로이터",
            url: "https://www.reuters.com/world/china/iaea-confirms-entrances-irans-natanz-enrichment-plant-were-bombed-2026-03-03/",
          },
          { id: "crs-hormuz", label: "미 의회조사국 등" },
        ],
        caveat:
          "우크라이나 소행으로 읽히지 않게. 화염 마커는 미·이스라엘 작전 보도 권역(공개 좌표 범위)",
        scene: {
          asOf: "2026-03",
          camera: { lat: 33.5, lng: 51.5, altitude: 1.15 },
          layers: [
            ...sitesToFireLayers(IRAN_STRIKE_SITES),
            {
              type: "arc",
              label: "미·이스라엘→이란 (보도)",
              tag: "보도",
              from: [34.8, 32.1],
              to: [51.726, 33.725],
            },
          ],
          callouts: [
            {
              anchor: [51.726, 33.725],
              title: "이란 본토 타격",
              tag: "보도",
              note: "나타즈·포르도·이스파한 등. 우크 카스피해 타격과 구분",
            },
          ],
        },
      },
      {
        id: "c3-resupply",
        text: "이란전에서 소모된 이란 무기고를 러시아가 채워주고 있다는 보도",
        tag: "보도",
        grade: "C",
        sources: [
          {
            id: "critical-threats",
            label: "Critical Threats",
            url: "https://www.criticalthreats.org/analysis/iran-update-special-report-august-18-2026",
          },
        ],
        caveat: "지원 보도와 참전은 구분한다",
        scene: {
          asOf: "2026-08",
          camera: { lat: 40, lng: 50, altitude: 1.5 },
          layers: [
            {
              type: "arc",
              label: "러시아→이란 재보급",
              tag: "보도",
              from: [37.6, 55.75],
              to: [51.4, 35.7],
            },
            ...sitesToFireLayers(
              IRAN_STRIKE_SITES.filter((s) =>
                ["isfahan-hesa", "tehran-military"].includes(s.id),
              ),
            ),
          ],
          callouts: [
            {
              anchor: [48, 45],
              title: "재보급 보도",
              tag: "보도",
              note: "라벨은 '무기 지원'. 직접 참전으로 읽히지 않게",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c4",
    name: "제재 우회 교역·해운망 (그림자 함대)",
    summary:
      "러시아·이란·베네수엘라의 제재 원유를 낡은 유조선, 위장 국기, 제3국 무역회사로 옮기는 느슨한 네트워크.",
    triggers: [
      "그림자 함대",
      "유조선 나포",
      "제재 우회",
      "위장 국기",
      "2차 제재",
      "러시아산 원유",
    ],
    doNotAssert: [
      "척수와 비중을 하나로 단정하지 않는다",
      "위장 국기 선박을 러시아 소속이라고 쓰지 않는다",
      "나포 뉴스를 곧바로 유가 상승으로 잇지 않는다",
    ],
    marketTouchpoints: ["원유", "유조선 운임", "해상 보험"],
    relatedCardIds: ["c5", "c6"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 59.9, lng: 30.3, label: "발트 수출" },
      { lat: 10.5, lng: -66.9, label: "베네수엘라" },
      { lat: 36.5, lng: 120.5, label: "산둥" },
    ],
    claims: [
      {
        id: "c4-marinera",
        text: "2026년 1월 미국이 영국 지원으로 마리네라(전 Bella 1)를 나포했다",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "atlantic-seizure",
            label: "Atlantic Council",
            url: "https://www.atlanticcouncil.org/dispatches/when-economic-warfare-meets-gunboat-diplomacy-what-to-know-about-the-us-seizures-of-shadow-fleet-tankers/",
          },
        ],
        caveat: "척수·비중을 단정하지 않는다. '러시아 소속' 표기 금지",
        scene: {
          asOf: "2026-01",
          camera: { lat: 20, lng: -40, altitude: 1.8 },
          layers: [
            {
              type: "point",
              label: "마리네라 나포",
              tag: "확립",
              at: [-50, 15],
            },
            {
              type: "arc",
              label: "베네수엘라발 항로 (예시)",
              tag: "추정",
              from: [-66.9, 10.5],
              to: [-20, 40],
            },
          ],
          callouts: [
            {
              anchor: [-50, 15],
              title: "마리네라 나포 (2026-01)",
              tag: "확립",
              note: "억지 신호지만 영향은 제한적이라는 분석이 있다",
            },
          ],
        },
      },
      {
        id: "c4-uk-channel",
        text: "2026년 6월 영국 해병대가 영국해협에서 러시아 연계 유조선을 나포했다",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "aljazeera-uk",
            label: "Al Jazeera",
            url: "https://www.aljazeera.com/news/2026/6/16/uk-seizes-russian-shadow-fleet-tanker-what-that-means",
          },
        ],
        caveat: "연계와 소속을 혼동하지 않는다",
        scene: {
          asOf: "2026-06",
          camera: { lat: 50.5, lng: 0.5, altitude: 1.0 },
          layers: [
            {
              type: "point",
              label: "영국해협 나포",
              tag: "확립",
              at: [0.5, 50.5],
            },
            {
              type: "line",
              label: "발트·북해 수출 항로",
              tag: "추정",
              path: [
                [30.3, 59.9],
                [10.0, 57.0],
                [1.0, 51.0],
              ],
            },
          ],
          callouts: [
            {
              anchor: [0.5, 50.5],
              title: "영국해협 나포 (2026-06)",
              tag: "확립",
              note: "보험·등록·금융 쪽 압박이 더 효과적이라는 분석",
            },
          ],
        },
      },
      {
        id: "c4-iran-china",
        text: "이란 그림자 함대는 중국 산둥 독립 정유사(티팟)와의 거래에 익숙하다",
        tag: "분석",
        grade: "D",
        sources: [
          {
            id: "mei-shadow",
            label: "MEI",
            url: "https://mei.edu/policymemo/how-iran-china-and-russia-use-the-shadow-fleet-to-evade-us-sanctions/",
          },
        ],
        caveat: "척수를 하나로 단정하지 않는다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 25, lng: 70, altitude: 1.9 },
          layers: [
            {
              type: "arc",
              label: "이란→중국 항로",
              tag: "분석",
              from: [56.0, 27.0],
              to: [120.5, 36.5],
            },
            {
              type: "point",
              label: "산둥 정유사 지역",
              tag: "분석",
              at: [120.5, 36.5],
            },
          ],
          callouts: [
            {
              anchor: [120.5, 36.5],
              title: "산둥 티팟",
              tag: "분석",
              note: "카드 5 이란 원유 우회 수출과 연결",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c5",
    name: "호르무즈·바브엘만데브 해상 초크포인트",
    summary:
      "이란전으로 호르무즈 통행이 급감하고 홍해 남단도 영향을 받아, 유가·운임·보험이 직접 흔들리는 자리.",
    triggers: [
      "호르무즈",
      "바브엘만데브",
      "페림섬",
      "모카",
      "동서 송유관",
      "얀부",
      "후티 봉쇄",
      "전쟁위험 보험료",
      "프로젝트 프리덤",
      "미 항모",
      "아라비아해",
    ],
    doNotAssert: [
      "통행 수치는 하나로 단정하지 않는다",
      "폐쇄는 완전 봉쇄가 아니라 통행 급감과 호위 통행이 섞인 상태다",
      "후티·이란 배후 관계를 사실처럼 쓰지 않는다",
      "브렌트 가격 수준을 카드에 고정하지 않는다",
      "항모 함명·정확한 좌표를 단정하지 않는다",
    ],
    marketTouchpoints: [
      "원유·LNG",
      "사우디 원유 수출",
      "유조선 운임",
      "해상 보험",
      "정유 마진",
    ],
    relatedCardIds: ["c2", "c4", "c6", "c3", "c8"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 26.5, lng: 56.5, label: "호르무즈" },
      { lat: 12.65, lng: 43.4, label: "페림섬" },
      { lat: 24.1, lng: 38.1, label: "얀부" },
      { lat: 21.4, lng: 62.6, label: "미 항모 (북)" },
      { lat: 18.9, lng: 65.1, label: "미 항모 (남)" },
    ],
    claims: [
      {
        id: "c5-pipeline-shutdown",
        text: "사우디 동서 송유관이 2026-09-11 드론 공격 뒤 임시 중단됐다",
        tag: "확립",
        grade: "B",
        sources: [
          { id: "cnn-2026-09-14", label: "CNN" },
          { id: "aljazeera-2026-09-12", label: "Al Jazeera" },
          { id: "nbc-2026-09-12", label: "NBC" },
        ],
        counterClaim: "드론이 이라크에서 발사됐다는 것은 사우디·이라크 정부 발표",
        caveat: "재개 시점은 미정. 공급 이탈 비율은 추정이다",
        scene: {
          asOf: "2026-09-11",
          camera: { lat: 22.5, lng: 46.0, altitude: 1.35 },
          layers: [
            {
              type: "line",
              label: "동서 송유관",
              tag: "확립",
              path: [
                [49.7, 25.9],
                [38.1, 24.1],
              ],
            },
            {
              type: "point",
              label: "얀부",
              tag: "확립",
              at: [38.1, 24.1],
            },
            {
              type: "point",
              label: "페림섬",
              tag: "확립",
              at: [43.4, 12.65],
            },
          ],
          callouts: [
            {
              anchor: [39.6, 24.5],
              title: "드론 공격 지점 (메디나 일대)",
              tag: "확립",
              note: "발사 지점이 이라크라는 것은 양국 정부 발표",
              sourceIds: ["cnn-2026-09-14"],
            },
          ],
        },
      },
      {
        id: "c5-hormuz",
        text: "호르무즈 통행이 급감했다. 전쟁 전 하루 수십~백 척대에서 최고조에는 유조선 하루 수 척까지 줄었다는 보도",
        tag: "보도",
        grade: "C",
        sources: [
          {
            id: "carra-hormuz",
            label: "Carra Globe",
            url: "https://carraglobe.com/strait-of-hormuz-closure-2026/",
          },
        ],
        caveat: "통행 수치는 출처·기준선이 달라 씬에 고정 숫자를 넣지 않는다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 22.5, lng: 60.0, altitude: 1.35 },
          layers: [
            {
              type: "point",
              label: "호르무즈 통행 급감",
              tag: "보도",
              at: [56.25, 26.56],
              marker: "chokepoint",
            },
            {
              type: "point",
              label: "상선 (만 안쪽)",
              tag: "보도",
              at: [55.35, 26.95],
              marker: "ship",
            },
            {
              type: "point",
              label: "상선 (오만만)",
              tag: "보도",
              at: [57.55, 25.55],
              marker: "ship",
            },
            {
              type: "point",
              label: "미 항모 (북)",
              tag: "보도",
              at: [62.6, 21.4],
              marker: "carrier",
            },
            {
              type: "point",
              label: "미 항모 (남)",
              tag: "보도",
              at: [65.1, 18.9],
              marker: "carrier",
            },
            {
              type: "line",
              label: "희망봉 우회 (점선)",
              tag: "추정",
              path: [
                [56.5, 26.5],
                [40.0, 5.0],
                [18.4, -33.9],
                [-10.0, 35.0],
              ],
            },
          ],
          callouts: [
            {
              anchor: [56.5, 26.5],
              title: "호르무즈 통행 급감",
              tag: "보도",
              note: "'폐쇄'는 완전 봉쇄가 아니라 통행 급감·호위 통행이 섞인 상태",
            },
            {
              anchor: [63.5, 20.2],
              title: "아라비아해 미 항모 2척",
              tag: "보도",
              note: "배치 대략치. 함명·정확한 좌표는 단정하지 않는다",
            },
          ],
        },
      },
      {
        id: "c5-perim",
        text: "2026년 9월 초 후티가 모카항과 바브엘만데브 입구의 페림(마윤)섬을 장악했다",
        tag: "확립",
        grade: "B",
        sources: [
          { id: "reuters-perim", label: "로이터" },
          { id: "cnn-perim", label: "CNN" },
        ],
        counterClaim: "이란의 개입 정도는 분석가 평가일 뿐 확정 사실이 아니다",
        caveat: "후티·이란 배후 관계를 사실처럼 쓰지 않는다",
        scene: {
          asOf: "2026-09",
          camera: { lat: 13.0, lng: 43.5, altitude: 0.9 },
          layers: [
            {
              type: "point",
              label: "바브엘만데브 조임",
              tag: "확립",
              at: [43.33, 12.58],
              marker: "chokepoint",
            },
            {
              type: "point",
              label: "상선 (홍해)",
              tag: "보도",
              at: [42.55, 13.55],
              marker: "ship",
            },
            {
              type: "point",
              label: "상선 (아덴만)",
              tag: "보도",
              at: [44.65, 11.95],
              marker: "ship",
            },
            {
              type: "point",
              label: "페림섬",
              tag: "확립",
              at: [43.4, 12.65],
            },
            {
              type: "point",
              label: "모카항",
              tag: "확립",
              at: [43.25, 13.32],
            },
          ],
          callouts: [
            {
              anchor: [43.4, 12.65],
              title: "페림섬 장악",
              tag: "확립",
              note: "로이터·CNN·NBC 등. 이란 배후는 [분석]로만",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c6",
    name: "북극항로·그린란드·희토류",
    summary:
      "얼음이 녹아 열리는 북극 항로와 그린란드의 광물이, 러시아의 인프라 우위와 중국의 자원 의존, 미국의 그린란드 압박이 맞부딪히는 자리.",
    triggers: [
      "북극항로",
      "북동항로",
      "빙상 실크로드",
      "그린란드",
      "탄브리즈",
      "희토류 수출통제",
      "영구자석",
      "아크틱 LNG 2",
      "쇄빙선",
    ],
    doNotAssert: [
      "북극항로가 수에즈나 호르무즈를 대체한다고 단정하지 않는다",
      "중국 독점이라고만 쓰지 않고 채굴·정제·자석 단계를 구분한다",
      "그린란드 관련 발언·위협과 실제 조치를 구분한다",
    ],
    marketTouchpoints: [
      "희토류·자석 관련 기업",
      "전기차·방산 공급망",
      "LNG",
      "해운",
    ],
    relatedCardIds: ["c4", "c5"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 72.0, lng: -40.0, label: "그린란드" },
      { lat: 72.0, lng: 140.0, label: "북동항로" },
      { lat: 35.0, lng: 105.0, label: "중국 희토류" },
    ],
    claims: [
      {
        id: "c6-nsr",
        text: "러시아는 세계 최대 쇄빙선단과 북동항로(NSR) 이용 조건을 요구한다",
        tag: "분석",
        grade: "D",
        sources: [
          {
            id: "cnn-nsr",
            label: "CNN",
            url: "https://www.cnn.com/2026/08/14/china/china-arctic-northern-sea-route-russia-intl-hnk-vis-dst",
          },
        ],
        caveat: "통항량은 아직 작다. 수에즈 대체라고 단정하지 않는다",
        scene: {
          asOf: "2026-09-20",
          camera: { lat: 75, lng: 90, altitude: 1.6 },
          layers: [
            {
              type: "line",
              label: "북동항로",
              tag: "분석",
              path: [
                [30, 70],
                [60, 72],
                [100, 74],
                [140, 70],
                [170, 65],
              ],
            },
            {
              type: "point",
              label: "아크틱 LNG 2",
              tag: "보도",
              at: [73.5, 71.0],
            },
          ],
          callouts: [
            {
              anchor: [90, 74],
              title: "북동항로 (NSR)",
              tag: "분석",
              note: "중국 '빙상 실크로드'는 발표 수준으로 점선 취급",
            },
          ],
        },
      },
      {
        id: "c6-greenland",
        text: "미국이 그린란드 획득을 국가안보 우선순위로 두고, 미군 활용은 항상 선택지라고 밝혔다",
        tag: "확립",
        grade: "B",
        sources: [
          { id: "abc-greenland", label: "ABC 등 다수 매체" },
          { id: "reuters-ankara", label: "로이터 (앙카라 발언)" },
        ],
        counterClaim:
          "그린란드 총리·외무장관은 섬의 미래는 주민이 결정한다고 했고, 덴마크 총리는 매물이 아니라고 했다",
        caveat: "발언·위협과 실제 조치를 구분한다. 영유권은 '주장 영역'으로만",
        scene: {
          asOf: "2026-07-07",
          camera: { lat: 72, lng: -40, altitude: 1.3 },
          layers: [
            {
              type: "point",
              label: "그린란드",
              tag: "확립",
              at: [-40, 72],
            },
            {
              type: "point",
              label: "탄브리즈",
              tag: "분석",
              at: [-45.5, 61.0],
            },
          ],
          callouts: [
            {
              anchor: [-40, 72],
              title: "그린란드 (주장·대응)",
              tag: "확립",
              note: "미국 성명 vs 그린란드·덴마크 당사자 주장",
            },
          ],
        },
      },
      {
        id: "c6-rare-earth",
        text: "중국 상무부 공고 2026년 제23호가 미국 기업 10곳을 수출통제 관리명단에 올렸다",
        tag: "확립",
        grade: "A",
        sources: [
          {
            id: "mofcom-23",
            label: "상무부 공고 (신화망)",
          },
          {
            id: "csis-ree",
            label: "CSIS",
            url: "https://www.csis.org/analysis/rare-earth-export-restrictions-one-year-later",
          },
        ],
        caveat:
          "전면적 희토류 수출 제한이 아니라 특정 기업 대상. 채굴·정제·자석 단계를 구분한다",
        scene: {
          asOf: "2026-06-22",
          camera: { lat: 35, lng: 105, altitude: 1.6 },
          layers: [
            {
              type: "point",
              label: "중국 정제·자석",
              tag: "확립",
              at: [105, 35],
            },
            {
              type: "point",
              label: "마운틴패스 (MP Materials)",
              tag: "확립",
              at: [-115.5, 35.5],
            },
          ],
          callouts: [
            {
              anchor: [105, 35],
              title: "수출통제 명단 (2026-06-22)",
              tag: "확립",
              note: "유예 만료일 조항마다 다름 (예: 2026-11-10)",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c7",
    name: "북러 협력: 파병·기술이전·드론 커넥션",
    summary:
      "북한이 포탄·미사일·병력·노동력을 대고, 러시아가 실전 무대와 기술을 주는 교환 구조. 중국 공급망·남캅카스 회랑과 연결된다.",
    triggers: [
      "북러 조약",
      "북한 파병",
      "파병 교관",
      "금성 드론",
      "샤헤드 북한 생산",
      "KN-23",
      "두만강-하산",
      "장보고-N",
      "을지 프리덤 실드",
      "TRIPP",
      "잔게주르",
    ],
    doNotAssert: [
      "핵잠수함·위성 기술 이전을 확인된 사실처럼 쓰지 않는다",
      "GUR 발언은 우크라이나 측 주장으로 쓴다",
      "북한과 남캅카스의 직접 연결을 만들어 쓰지 않는다",
      "중국 기업의 위장 수출을 중국 정부 지원으로 쓰지 않는다",
    ],
    marketTouchpoints: [
      "방산·대드론",
      "조선(잠수함)",
      "전자부품 공급망",
      "한반도 위험 프리미엄",
    ],
    relatedCardIds: ["c1", "c2", "c6"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 39.0, lng: 125.8, label: "평양" },
      { lat: 55.76, lng: 52.05, label: "옐라부가" },
      { lat: 42.2, lng: 43.97, label: "츠힌발리" },
    ],
    claims: [
      {
        id: "c7-tech-transfer",
        text: "MSMT 보고서: 러시아가 방공·전자전 장비 등을 북한에 준 것으로 '믿는다'. 포병·UAV·보병 훈련도 기술",
        tag: "확립",
        grade: "A",
        sources: [
          {
            id: "msmt-2025-05",
            label: "MSMT 2025-05 보고서",
          },
        ],
        caveat: "문서가 회원국 정보에 기댄 '믿는다' 수준이다. 핵잠 이전은 미확인",
        scene: {
          asOf: "2025-05",
          camera: { lat: 45, lng: 130, altitude: 1.5 },
          layers: [
            {
              type: "arc",
              label: "러시아→북한 기술 (점선)",
              tag: "확립",
              from: [37.6, 55.75],
              to: [125.8, 39.0],
            },
            {
              type: "point",
              label: "평양",
              tag: "확립",
              at: [125.8, 39.0],
            },
            {
              type: "line",
              label: "두만강-하산 철도",
              tag: "추정",
              path: [
                [130.4, 42.2],
                [130.8, 42.5],
              ],
            },
          ],
          callouts: [
            {
              anchor: [125.8, 39.0],
              title: "기술·훈련 환류",
              tag: "확립",
              note: "GUR의 생산 기반 주장은 당사자 주장으로 분리",
            },
          ],
        },
      },
      {
        id: "c7-china-parts",
        text: "러시아 게란 계열의 중국산 부품 의존이 커졌다는 보도·주장. 위장 수출 사례가 보도됨",
        tag: "보도",
        grade: "C",
        sources: [
          { id: "gur-china-parts", label: "GUR 주장" },
          { id: "reuters-kupol", label: "로이터" },
        ],
        counterClaim: "중국 대사관은 이중용도 물품을 엄격히 통제한다고 밝혔다",
        caveat: "기업 단위 위장 수출을 중국 정부 방침으로 쓰지 않는다",
        scene: {
          asOf: "2026-05",
          camera: { lat: 45, lng: 90, altitude: 1.7 },
          layers: [
            {
              type: "arc",
              label: "중국→러시아 부품",
              tag: "보도",
              from: [116.4, 39.9],
              to: [52.05, 55.76],
            },
            {
              type: "point",
              label: "옐라부가",
              tag: "보도",
              at: [52.05, 55.76],
            },
          ],
          callouts: [
            {
              anchor: [80, 48],
              title: "중국산 부품 경로",
              tag: "보도",
              note: "정부 지원으로 읽히지 않게",
            },
          ],
        },
      },
      {
        id: "c7-mrb",
        text: "남오세티아 MRB 은행이 북한 은행의 루블 계좌를 열어줬다 (금융 직접 연결)",
        tag: "확립",
        grade: "A",
        sources: [
          { id: "msmt-mrb", label: "MSMT 보고서" },
          { id: "ust-2024-09", label: "미 재무부 2024-09" },
        ],
        caveat:
          "TRIPP가 지나는 아르메니아·아제르바이잔이 아니라 조지아 점령지. 군사 직접 연결과 혼동하지 않는다",
        scene: {
          asOf: "2024-09",
          camera: { lat: 42.2, lng: 44.0, altitude: 1.1 },
          layers: [
            {
              type: "point",
              label: "츠힌발리 MRB",
              tag: "확립",
              at: [43.97, 42.23],
            },
            {
              type: "line",
              label: "정황 체인 NK→이란→남캅카스",
              tag: "정황",
              path: [
                [125.8, 39.0],
                [51.4, 35.7],
                [46.0, 39.2],
              ],
            },
            {
              type: "point",
              label: "메그리·TRIPP 구간",
              tag: "확립",
              at: [46.25, 38.9],
            },
          ],
          callouts: [
            {
              anchor: [43.97, 42.23],
              title: "MRB 금융 채널",
              tag: "확립",
              note: "정황 체인은 회색 점선·별도 범례. 군사 직접 연결 아님",
            },
          ],
        },
      },
    ],
  },
  {
    id: "c8",
    name: "예멘 홍해 전선: 후티 확장·정부군 반격·사우디 공습",
    summary:
      "후티가 홍해 연안·모카·페림을 밀어 바브엘만데브를 조이고, 정부군은 타이즈·마리브·자우프에서 연속 반격을 주장하며, 사우디·정부 공습이 맞붙는 자리.",
    triggers: [
      "후티",
      "홍해",
      "모카",
      "페림",
      "마윤",
      "바브엘만데브",
      "호데이다",
      "타이즈",
      "마리브",
      "자우프",
      "사우디 공습",
      "예멘 정부군",
      "하니시",
    ],
    doNotAssert: [
      "전선·점령 면적을 하나로 단정하지 않는다 (표시는 단순화)",
      "후티·이란 배후를 사실처럼 쓰지 않는다",
      "정부군 '연속 승리'는 당사자·친정부 발표를 교차검증 전제로 둔다",
      "사우디 공습 횟수·피해를 카드에 고정하지 않는다",
    ],
    marketTouchpoints: [
      "홍해·바브엘만데브 통행",
      "원유·유조선 운임",
      "해상 보험",
      "사우디 원유 수출",
    ],
    relatedCardIds: ["c5", "c3", "c4"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 13.32, lng: 43.25, label: "모카항" },
      { lat: 12.65, lng: 43.4, label: "페림섬" },
      { lat: 14.8, lng: 42.95, label: "호데이다" },
      { lat: 15.45, lng: 45.3, label: "마리브" },
    ],
    claims: [
      {
        id: "c8-houthi-redsea",
        text: "후티가 모카항과 페림(마윤)섬 등을 장악하며 홍해·바브엘만데브 일대 영향력을 넓혔다",
        tag: "확립",
        grade: "B",
        sources: [
          {
            id: "reuters-houthi-bab",
            label: "로이터",
            url: "https://www.reuters.com/world/middle-east/saudi-says-no-danger-after-khamis-mushait-alert-amid-clashes-with-houthis-2026-09-10/",
          },
          {
            id: "bbc-houthi-redsea",
            label: "BBC",
            url: "https://www.bbc.co.uk/news/articles/c23x72yx2rvo",
          },
          {
            id: "cnn-mocha",
            label: "CNN",
            url: "https://www.cnn.com/2026/09/10/middleeast/houthis-capture-mocha-red-sea-strait-intl",
          },
        ],
        counterClaim:
          "전선은 날마다 바뀌고, '연안 전체 장악' 표현은 출처마다 범위가 다르다",
        caveat:
          "글로브의 색 면은 단순화 표시용이다. 확정 국경·점령 면적이 아니다",
        scene: {
          asOf: "2026-09",
          camera: { lat: 13.2, lng: 43.5, altitude: 0.85 },
          layers: [
            {
              type: "point",
              label: "호데이다",
              tag: "확립",
              at: [42.95, 14.8],
            },
            {
              type: "point",
              label: "모카항",
              tag: "확립",
              at: [43.25, 13.32],
            },
            {
              type: "point",
              label: "페림섬",
              tag: "확립",
              at: [43.4, 12.65],
            },
            {
              type: "line",
              label: "홍해 연안 남하",
              tag: "보도",
              path: [
                [42.95, 14.8],
                [43.25, 13.32],
                [43.4, 12.65],
              ],
            },
          ],
          callouts: [
            {
              anchor: [43.4, 12.65],
              title: "바브엘만데브 조임",
              tag: "확립",
              note: "로이터·BBC·CNN 등. 지도 색 면은 애니메이션 표시용",
              sourceIds: ["reuters-houthi-bab", "bbc-houthi-redsea"],
            },
          ],
        },
      },
      {
        id: "c8-gov-wins",
        text: "예멘 정부군·친정부 세력이 타이즈·마리브·자우프 등에서 후티 공격을 막고 일부 고지·지역을 되찾았다고 발표했다",
        tag: "당사자 주장",
        grade: "C",
        sources: [
          {
            id: "arabnews-kahbub",
            label: "Arab News",
            url: "https://www.arabnews.jp/en/middle-east/yemeni-forces-battle-houthi-assaults-on-strategic-heights-overlooking-bab-al-mandab-3000219/",
          },
          {
            id: "aa-taiz",
            label: "아나돌루",
            url: "https://www.aa.com.tr/en/middle-east/yemeni-warplanes-strike-houthi-positions-east-of-taiz-city/4061662",
          },
        ],
        counterClaim:
          "후티 쪽도 대규모 성과를 주장한다. '연속 승리'는 한쪽 발표만으로 굳히지 않는다",
        caveat: "친정부·정부 발표 비중. 독립 취재로 면적·사상자는 교차할 것",
        scene: {
          asOf: "2026-09",
          camera: { lat: 14.8, lng: 44.6, altitude: 1.05 },
          layers: [
            {
              type: "point",
              label: "타이즈",
              tag: "보도",
              at: [44.02, 13.58],
            },
            {
              type: "point",
              label: "마리브",
              tag: "당사자 주장",
              at: [45.32, 15.46],
            },
            {
              type: "point",
              label: "자우프",
              tag: "당사자 주장",
              at: [44.78, 16.15],
            },
          ],
          callouts: [
            {
              anchor: [44.1, 13.5],
              title: "정부군 반격 주장",
              tag: "당사자 주장",
              note: "고지 사수·일부 탈환 발표. 교차검증 전 단정 금지",
            },
          ],
        },
      },
      {
        id: "c8-saudi-strikes",
        text: "사우디·예멘 정부 측 공습이 타이즈·호데이다·모카 접근로 등 후티 진영에 이어지고, 후티도 사우디 남부·인프라를 겨냥한 공격을 주장·보도한다",
        tag: "보도",
        grade: "C",
        sources: [
          { id: "bbc-houthi-redsea", label: "BBC" },
          { id: "aa-taiz", label: "아나돌루" },
          { id: "reuters-houthi-bab", label: "로이터" },
        ],
        counterClaim: "타격 횟수·피해 규모는 발표마다 다르다",
        caveat: "공습 표시는 보도된 전선 일대 참고 지점이다. 정확한 탄착점이 아니다",
        scene: {
          asOf: "2026-09",
          camera: { lat: 15.5, lng: 44.0, altitude: 1.15 },
          layers: [
            {
              type: "arc",
              label: "사우디→타이즈 공습",
              tag: "보도",
              from: [44.8, 18.2],
              to: [44.15, 13.55],
            },
            {
              type: "arc",
              label: "사우디→호데이다 공습",
              tag: "보도",
              from: [42.5, 18.0],
              to: [43.0, 14.8],
            },
            {
              type: "point",
              label: "타이즈 동부 타격",
              tag: "보도",
              at: [44.15, 13.55],
              marker: "fire",
            },
            {
              type: "point",
              label: "호데이다 일대 타격",
              tag: "보도",
              at: [43.0, 14.8],
              marker: "fire",
            },
            {
              type: "point",
              label: "모카 접근로",
              tag: "보도",
              at: [43.4, 13.4],
              marker: "fire",
            },
          ],
          callouts: [
            {
              anchor: [44.5, 16.5],
              title: "공습 ↔ 전선",
              tag: "보도",
              note: "폭격 도장은 전선 일대 표시. 탄착점 확정이 아님",
            },
          ],
        },
      },
    ],
  },
];

export function getCardById(id: string): NetworkCard | undefined {
  return cards.find((c) => c.id === id);
}

export function getCardSummariesForPrompt() {
  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    summary: c.summary,
    triggers: c.triggers,
  }));
}

export const EXAMPLE_NEWS = `2026년 9월 11일, 사우디아라비아는 이라크에서 발사된 것으로 추정되는 드론 공격 이후 동서 송유관(아브카이크~얀부)의 가동을 임시 중단했다고 발표했다. CNN, 로이터, Al Jazeera 등 주요 매체가 사우디 정부 발표를 인용해 보도했다. 이 송유관은 호르무즈 해협을 우회해 홍해 얀부항으로 원유를 보내는 경로로, 분석가들은 세계 원유 공급의 최대 4%가 영향을 받을 수 있다고 추정했다. 재개 시점은 아직 정해지지 않았다.

같은 시기 후티 세력은 예멘 홍해 연안의 모카항과 바브엘만데브 해협 입구의 페림(마윤)섬을 장악했다는 보도가 나왔다. 예멘 정부군은 타이즈·마리브·자우프 등에서 후티 공격을 막고 일부 고지를 되찾았다고 발표했고, 사우디·정부 측 공습도 이어졌다. 이란전 이후 호르무즈 통행이 급감한 가운데 홍해 남단 초크포인트까지 동시에 흔들리면서 전쟁위험 보험료와 유조선 운임에 대한 시장 관심이 커지고 있다.`;
