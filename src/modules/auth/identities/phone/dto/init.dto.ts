export interface InitCallReqDto {
  phone: number;
  code: number;
  client: string;
}

export interface InitCallReqBody extends InitCallReqDto {
  unique: string;
  voice: boolean;
}

export interface InitCallResBody {
  status: boolean;
  ucaller_id: number;
  phone: string;
  code: string;
  client: string;
  unique_request_id: string;
}
