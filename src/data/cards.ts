import type { NetworkCard } from "@/types";

export const cards: NetworkCard[] = [
  {
    id: "c1",
    name: "러시아·이란·북한 드론·무기 네트워크",
    summary:
      "이란이 드론 기술을 넘기고, 러시아가 대량 생산하고, 북한이 탄약과 인력을 대며 러시아의 전쟁을 떠받치는 구조.",
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
              at: [52.05, 55.76],
            },
            {
              type: "point",
              label: "테헤란",
              tag: "확립",
              at: [51.4, 35.7],
            },
          ],
          callouts: [
            {
              anchor: [52.05, 55.76],
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
      "같은 무기 기술과 공급망이 두 전쟁을 오가서, 한쪽 뉴스가 다른 쪽의 원인이나 결과가 될 수 있다.",
    triggers: [
      "샤헤드",
      "게란-5",
      "러-이란 협력",
      "이란 전쟁",
      "러시아 이란 지원",
    ],
    doNotAssert: [
      "러시아가 이란전에 직접 참전했다고 쓰지 않는다",
      "무기 지원 보도와 참전은 다르다",
    ],
    marketTouchpoints: ["원유", "방산", "해상 운임·보험"],
    relatedCardIds: ["c1", "c5", "c2"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 48.5, lng: 31.0, label: "우크라이나" },
      { lat: 32.0, lng: 53.0, label: "이란" },
      { lat: 55.76, lng: 52.05, label: "옐라부가" },
    ],
    claims: [
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
          camera: { lat: 40, lng: 45, altitude: 1.7 },
          layers: [
            {
              type: "arc",
              label: "이란→러시아",
              tag: "분석",
              from: [51.4, 35.7],
              to: [52.05, 55.76],
            },
            {
              type: "arc",
              label: "러시아→이란 (추정)",
              tag: "추정",
              from: [52.05, 55.76],
              to: [51.4, 35.7],
            },
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
        text: "이란전 배경: 2026년 2월 28일경부터 미국·이스라엘이 이란을 공격했다는 보도",
        tag: "보도",
        grade: "B",
        sources: [
          { id: "crs-hormuz", label: "미 의회조사국 등" },
        ],
        caveat: "정확한 개시일은 자료마다 표현이 다를 수 있다",
        scene: {
          asOf: "2026-02",
          camera: { lat: 32, lng: 53, altitude: 1.4 },
          layers: [
            {
              type: "point",
              label: "이란",
              tag: "보도",
              at: [53.0, 32.0],
            },
          ],
          callouts: [
            {
              anchor: [53.0, 32.0],
              title: "이란전 개시 (2026년 2월 말)",
              tag: "보도",
              note: "여러 출처가 일치하는 보도. 러시아 직접 참전으로 읽히지 않게",
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
    ],
    doNotAssert: [
      "통행 수치는 하나로 단정하지 않는다",
      "폐쇄는 완전 봉쇄가 아니라 통행 급감과 호위 통행이 섞인 상태다",
      "후티·이란 배후 관계를 사실처럼 쓰지 않는다",
      "브렌트 가격 수준을 카드에 고정하지 않는다",
    ],
    marketTouchpoints: [
      "원유·LNG",
      "사우디 원유 수출",
      "유조선 운임",
      "해상 보험",
      "정유 마진",
    ],
    relatedCardIds: ["c2", "c4", "c6", "c3"],
    asOf: "2026-09-20",
    focusPoints: [
      { lat: 26.5, lng: 56.5, label: "호르무즈" },
      { lat: 12.65, lng: 43.4, label: "페림섬" },
      { lat: 24.1, lng: 38.1, label: "얀부" },
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
          camera: { lat: 26.5, lng: 56.5, altitude: 1.0 },
          layers: [
            {
              type: "point",
              label: "호르무즈",
              tag: "보도",
              at: [56.5, 26.5],
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
            {
              type: "point",
              label: "바브엘만데브",
              tag: "확립",
              at: [43.3, 12.6],
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

같은 시기 후티 세력은 예멘 홍해 연안의 모카항과 바브엘만데브 해협 입구의 페림(마윤)섬을 장악했다는 보도가 나왔다. 이란전 이후 호르무즈 통행이 급감한 가운데, 홍해 남단 초크포인트까지 동시에 흔들리면서 전쟁위험 보험료와 유조선 운임에 대한 시장 관심이 커지고 있다.`;
