# cardoc-subject

## 타이어 API 설계 및 구현

## 서비스 URL
https://vast-cove-84089.herokuapp.com/


## 개발 환경
- 언어 : TypeScript
- 프레임워크 : NestJS
- DB : SQLite3
- 라이브러리 : axios, passport, jwt, bcrypt, typeOrm, class-validator
- 배포 환경 : heroku


## 요구사항
- [x] RDB 사용
- [x] 실행 방법 서술
- [x] ORM 사용
- [x] response status(200 OK: 성공, 400 Bad Request: 잘못된 파라미터, 401 Unauthorized: 인증 헤더 오류, 500 Internal Server Error: 기타 서버 에러) 반환
- [x] 사용자 생성 API
  - [x] ID / Password로 사용자 생성 구현
  - [x] ID / Password로 로그인 구현
  - [x] 인증 토큰 발급
  - [x] 인증 토큰으로 인증된 사용자만 API 호출 가능
- [x] 사용자가 소유한 타이어 정보 저장 API
  - [x] 자동차 차종 ID(trimID)를 사용하여 사용자가 소유한 자동차 정보 저장. 
  - [x] 타이어 정보 저장. 타이어 정보는 `자동차 정보 API(trimID) -> spec -> driving -> frontTire/rearTire` 에 있음
  - [x] 한번에 최대 5명까지의 사용자에 대한 요청을 받을 수 있음. 즉, 사용자 정보와 trimID 5쌍을 요청데이터로 하여 API를 호출할 수 있음
    - [x] 5명이 넘어가는 요청에 적당한 에러 처리
  - [x] `{폭}/{편평비}R{휠 사이즈}`과 같은 형식의 데이터일 경우만 DB에 항목별로 나누어 서로 다른 Column에 저장
  예: `205/75R18` -> 타이어 폭: 205, 편평비: 75, 휠 사이즈: 18
  - [x] 유효하지 않은 trimID 일 경우 에러 처리(유효하지 않은 trimID로 자동차 정보 API를 호출하면 `{"code":-1000,"message":"No value present"}` 라는 response를 받음)
- [x] 사용자 소유 타이어 정보 조회 API
  - [x] 사용자 ID를 통해 저장한 타이어 정보를 조회할 수 있음
  - [x] 페이지네이션
    - [x] page, pageSize, totalCount(response) 사용


## API(Postman)
https://documenter.getpostman.com/view/18183669/UVJbHdG1


## 주요 기능
### 사용자 생성
- ID와 PASSWORD를 입력하여 사용자 생성을 할 수 있습니다.
- class-validator에서 유효성 검사를 하여 형식에 맞지 않는 데이터를 입력할 경우 이에 대한 에러메시지를 응답으로 반환합니다.
- ID 중복 체크를 하여 해당 ID가 이미 존재하는 경우 관련된 응답을 반환합니다.

### 로그인
- local-strategy를 사용하여 ID와 PASSWORD가 일치하는지 확인합니다. 일치하는 경우 ID를 jwt로 토큰화하여 응답으로 반환합니다.
- 존재하지 않는 ID나 일치하지 않는 PASSWORD로 로그인 할 경우, 401 상태 코드를 반환합니다.

### 타이어 정보 저장
- 로그인을 통해 받은 토큰으로 요청을 전달해야 해당 API를 호출할 수 있습니다.
- 확장 가능성을 고려하여 소유 자동차 정보(trimId)를 OWN_CAR 테이블에 저장합니다.
- 요청으로 전달받은 회원 ID(userId)와 차종 ID(trimId)를 통해 외부 API(`https://dev.mycar.cardoc.co.kr/v1/trim/{trimId}`)로부터 해당 자동차의 정보를 가져오며, `자동차 정보 -> spec -> driving -> frontTire/rearTire` 에서 타이어 정보를 가져옵니다.
이때, API의 결과를 다음의 4가지 형태로 구분할 수 있습니다.
  1. 전, 후 타이어 정보가 `{폭}/{편평비}R{휠 사이즈}` 형식의 데이터인 경우

      <img src="https://user-images.githubusercontent.com/51621520/143668374-d3d00828-2d0f-46e2-9a9f-b799371f33de.png" width=45% />
    
      - 전, 후 타이어의 폭, 편평비, 휠 사이즈를 각각 구분하여 DB에 저장합니다.

  2. 타이어 정보가 입력되지 않은 경우

      <img src="https://user-images.githubusercontent.com/51621520/143668458-1ececbb3-004f-431a-9531-a40c86391aa8.png" width=45% />
    
      - 에러 메시지(`invalid front tire format()`)를 응답으로 반환합니다.

  3. 타이어 정보가 형식에 맞지 않는 경우
  
      <img src="https://user-images.githubusercontent.com/51621520/143669947-4d443bd5-f815-47b0-ab26-c00c02c406a2.png" width=45% />
    
      - 에러 메시지(`invalid front tire format(155R-12래디얼)`)를 응답으로 반환합니다.

  4. trimId가 잘못된 경우

      <img src="https://user-images.githubusercontent.com/51621520/143668474-10ed497e-7a36-4a9b-9d98-96ed42c4623f.png" width=30% />
    
      - 에러 메시지(`No value present`)를 응답으로 반환합니다.

- 한 번의 요청에 최대 5개까지의 데이터를 입력할 수 있습니다. 또한 각각의 데이터에 대해 성공, 실패를 구분하여 응답으로 반환합니다.
- 입력 데이터가 없거나 배열 형태가 아닌 요청에 대해서 에러를 응답으로 반환합니다.
- 요청이 들어오면 소유 자동차 정보(trimId)를 OWN_CAR 테이블에, 타이어 정보를 TIRE 테이블에 저장합니다. 에러가 발생할 경우를 대비하여 트랜잭션을 적용하였습니다.

### 타이어 정보 조회
- 사용자 ID(userId)를 path parameter로 받아 저장한 타이어 정보를 조회할 수 있습니다.
- 페이지네이션 처리를 하였으며, page, pageSize를 query parameter로 받아 해당 데이터를 조회할 수 있습니다.


## 서비스 구조
![image](https://user-images.githubusercontent.com/51621520/143671187-7e7a61b3-48c2-4575-88b4-083d562b0743.png)

- 타이어 정보를 저장하고 조회하는 역할에 복잡한 로직이 필요하지 않다고 판단하여 backend 서버(nodejs)와 데이터베이스(sqlite)만 구축하였습니다.
- layered pattern을 사용하였으며, 로직들을 각각의 도메인 디렉토리에 위치시켜 구분하기 쉽도록 작성하였습니다.


## DB 모델링
![image](https://user-images.githubusercontent.com/51621520/143665121-823a6055-c40e-4540-b265-75d9e2bc473b.png)


## 실행 방법
1. `git clone` 명령어로 프로젝트 파일을 가져옵니다.

2. `npm install` 명령으로 서버 실행에 필요한 패키지를 설치합니다.

3. `npm build` 명령으로 프로젝트를 빌드합니다.

4. .env 파일을 작성하여 dist 폴더로 이동시킵니다. 해당 파일에는 PORT(실행시킬 PORT 값), JWT_SECRET(jwt secret 값), JWT_EXPIRATION(토큰 만료 시간)을 정의합니다.

    .env
    ```
    PORT=3000
    JWT_SECRET=1q2w3e4r
    JWT_EXPIRATION=1h
    ```

    또는 PORT, JWT_SECRET, JWT_EXPIRATION을 환경변수로 등록합니다.
    ```
    $ export PORT=3000
    $ export JWT_SECRET=1q2w3e4r
    $ export JWT_EXPIRATION=1h
    ```

5. `npm run start:prod` 명령어로 서버를 실행시킵니다.
    ```
    $ npm run start:prod
    ```


## 폴더 구조
```
.
├── .env
├── .eslintrc.js
├── .github
│   ├── ISSUE_TEMPLATE
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── .prettierrc
├── Procfile
├── README.md
├── nest-cli.json
├── package-lock.json
├── package.json
├── src
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   ├── auth.service.ts
│   │   ├── constants
│   │   │   └── auth.constants.ts
│   │   ├── dto
│   │   │   └── login-user.dto.ts
│   │   ├── guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   └── strategies
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── common
│   │   └── decorator
│   │       └── get-user.decorator.ts
│   ├── main.ts
│   ├── own-cars
│   │   ├── constants
│   │   │   └── own-cars.constants.ts
│   │   ├── dto
│   │   │   └── create-own-car.dto.ts
│   │   ├── entities
│   │   │   └── own-car.entity.ts
│   │   ├── own-cars.module.ts
│   │   ├── own-cars.service.spec.ts
│   │   └── own-cars.service.ts
│   ├── tires
│   │   ├── constants
│   │   │   └── tire.constants.ts
│   │   ├── dto
│   │   │   └── create-tire.dto.ts
│   │   ├── entities
│   │   │   └── tire.entity.ts
│   │   ├── tires.controller.spec.ts
│   │   ├── tires.controller.ts
│   │   ├── tires.module.ts
│   │   ├── tires.service.spec.ts
│   │   └── tires.service.ts
│   └── users
│       ├── constants
│       │   └── users.constants.ts
│       ├── dto
│       │   └── create-user.dto.ts
│       ├── entities
│       │   └── user.entity.ts
│       ├── users.module.ts
│       ├── users.service.spec.ts
│       └── users.service.ts
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json

23 directories, 53 files
```


## 회고
