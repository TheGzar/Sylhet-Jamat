import {GET,POST} from '../app/api/[...path]/route';
export default {fetch(request:Request){return request.method==='GET'?GET(request):POST(request)}};
