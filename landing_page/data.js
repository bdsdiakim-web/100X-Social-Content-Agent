/* ============================================================
   DỮ LIỆU DÙNG CHUNG — anh chỉ cần sửa file này
   - CONFIG: tên, số điện thoại, địa chỉ nối Google Sheet
   - PRICE:  giá thấp nhất / cao nhất cho từng dịch vụ (đơn vị: đồng)
   - SERVICES[].days: thời gian dự kiến [ít nhất, nhiều nhất] ngày
   - COMBOS: gói dịch vụ và quà tặng
   ============================================================ */

const CONFIG = {
  BRAND: "Vua Mặt Phố",
  SLOGAN: "Chúng tôi biến tài sản bạn đang nghĩ trong đầu thành hiện thực.",
  PHONE: "0911 530 000",
  PHONE2: "0988 410 000",
  ZALO: "0911 530 000",
  EMAIL: "Vuamatphohanoi@gmail.com",
  ADDRESS: "[địa chỉ văn phòng, đang cập nhật]",
  // Dán URL Web App của Google Apps Script vào đây. Để trống = chạy thử, lưu trên trình duyệt.
  ENDPOINT: "https://script.google.com/macros/s/AKfycbwj6AT0zecdNFNuJFMIqIOcDP7z22LHvmr_mDHYcTPpfmNm5BqCoCU-amRwz-7t9ox5/exec"
};

/* Giá dự kiến. null = chưa có giá, trang sẽ hiện "Liên hệ".
   Ví dụ: 1: {min: 3000000, max: 8000000} */
const PRICE = {
  1:{min:null,max:null},  2:{min:null,max:null},  3:{min:null,max:null},  4:{min:null,max:null},
  5:{min:null,max:null},  6:{min:null,max:null},  7:{min:null,max:null},  8:{min:null,max:null},
  9:{min:null,max:null}, 10:{min:null,max:null}, 11:{min:null,max:null}, 12:{min:null,max:null},
 13:{min:null,max:null}, 14:{min:null,max:null}, 15:{min:null,max:null}, 16:{min:null,max:null},
 17:{min:null,max:null}
 /* Dịch vụ 18 (tư vấn luật sư): giá lấy theo bảng giá từng luật sư trong LAWYERS bên dưới */
};

/* DANH SÁCH LUẬT SƯ HỢP TÁC — anh thay các dòng "(mẫu)" bằng luật sư thật và điền giá (đồng).
   mode: "phone" = qua điện thoại/Zalo video, "office" = gặp tại văn phòng, "doc" = soạn văn bản */
const LAWYERS = [
  {id:"LS01", name:"Luật sư A (mẫu)", org:"Văn phòng luật sư (mẫu) – Hà Nội", province:"Hà Nội", years:10,
   fields:["Đất đai, sổ đỏ","Thừa kế","Tranh chấp"],
   packages:[{name:"Tư vấn qua điện thoại, Zalo video 30 phút", mode:"phone", price:null},{name:"Gặp trực tiếp tại văn phòng 60 phút", mode:"office", price:null},{name:"Soạn đơn, văn bản pháp lý", mode:"doc", price:null}]},
  {id:"LS02", name:"Luật sư B (mẫu)", org:"Công ty luật (mẫu) – TP Hồ Chí Minh", province:"TP Hồ Chí Minh", years:7,
   fields:["Mua bán, đặt cọc","Xây dựng","Tranh chấp"],
   packages:[{name:"Tư vấn qua điện thoại, Zalo video 30 phút", mode:"phone", price:null},{name:"Gặp trực tiếp tại văn phòng 60 phút", mode:"office", price:null}]},
  {id:"LS03", name:"Luật sư C (mẫu)", org:"Văn phòng luật sư (mẫu) – Đà Nẵng", province:"Đà Nẵng", years:5,
   fields:["Thừa kế","Đất đai, sổ đỏ"],
   packages:[{name:"Tư vấn qua điện thoại, Zalo video 30 phút", mode:"phone", price:null},{name:"Gặp trực tiếp tại văn phòng 60 phút", mode:"office", price:null}]}
];

/* TÀI KHOẢN NHẬN TIỀN — điền đúng thông tin tài khoản đứng tên công ty hoặc chủ thương hiệu.
   bankId: mã ngân hàng để tạo mã QR (ví dụ "vietcombank", "techcombank", "mbbank", "vietinbank", "bidv", "acb") */
const BANK = {
  bankName: "Vietcombank",
  bankId: "vietcombank",
  account: "9983994804",
  holder: "PHÙNG HỮU ANH",
  branch: "",
  /* Cú pháp nội dung chuyển khoản: {ma} = mã hồ sơ, {sdt} = số điện thoại khách */
  syntax: "VMP {ma} {sdt}",
  /* Phí giữ lịch / đặt cọc khi đăng ký dịch vụ thường (null = chỉ chuyển sau khi có báo giá chính thức) */
  deposit: null
};

/* Kho giấy tờ. why = vì sao cần; where = lấy ở đâu, bổ sung thế nào */
const DOCS = {
  cccd:{name:"Căn cước / CCCD", why:"Xác định người có quyền ký hồ sơ. Đất là tài sản chung vợ chồng thì cả hai cùng ký.", where:"Mang bản gốc để đối chiếu. Mất thẻ thì làm lại tại công an xã, phường."},
  gcn:{name:"Sổ đỏ / sổ hồng bản gốc", why:"Giấy tờ pháp lý chính của thửa đất; cơ quan đăng ký thu bản gốc để chỉnh lý hoặc cấp sổ mới.", where:"Sổ đang thế chấp ngân hàng thì phải giải chấp hoặc có văn bản đồng ý của ngân hàng."},
  honnhan:{name:"Giấy tờ tình trạng hôn nhân", why:"Xác định nhà đất là tài sản riêng hay tài sản chung vợ chồng.", where:"Đã kết hôn: bản sao đăng ký kết hôn. Độc thân: xin giấy xác nhận tình trạng hôn nhân tại UBND xã, phường nơi cư trú."},
  khaitu:{name:"Trích lục khai tử của người để lại di sản", why:"Chứng minh thời điểm mở thừa kế.", where:"UBND xã, phường nơi đã đăng ký khai tử. Mất bản chính thì xin trích lục lại."},
  quanhe:{name:"Giấy tờ chứng minh quan hệ với người mất", why:"Xác định ai thuộc hàng thừa kế thứ nhất: vợ, chồng, cha mẹ, con.", where:"Giấy khai sinh, đăng ký kết hôn. Thiếu thì xin trích lục tại UBND xã, phường nơi đã đăng ký."},
  dichuc:{name:"Di chúc", why:"Có di chúc hợp pháp thì di sản chia theo di chúc.", where:"Bản gốc. Di chúc gửi giữ ở công chứng thì xin tại tổ chức công chứng đó."},
  tuchoi:{name:"Văn bản từ chối nhận di sản / khai tử của người thừa kế đã mất", why:"Cần khi có người không nhận phần hoặc có người thừa kế đã mất.", where:"Lập tại văn phòng công chứng, bên em soạn sẵn nội dung."},
  nguongoc:{name:"Giấy tờ về nguồn gốc đất", why:"Chứng minh đất được giao, mua, thừa kế từ trước; ảnh hưởng đến việc có phải nộp tiền sử dụng đất hay không.", where:"Giấy mua bán viết tay, quyết định giao đất, biên lai cũ. Không có thì cần UBND xã xác nhận quá trình sử dụng."},
  bienlai:{name:"Biên lai nộp thuế đất các năm", why:"Chứng cứ đã sử dụng đất ổn định, lâu dài.", where:"Tìm trong giấy tờ gia đình, hoặc xin xác nhận tại cơ quan thuế."},
  trichdo:{name:"Mảnh trích đo / trích lục bản đồ địa chính", why:"Xác định vị trí, ranh giới, diện tích thửa đất.", where:"Bên em làm cùng dịch vụ 05 Đo đạc địa chính."},
  hopdong:{name:"Hợp đồng / văn bản chuyển nhượng, tặng cho, thừa kế đã công chứng", why:"Căn cứ để đăng ký sang tên.", where:"Văn phòng công chứng nơi đã ký. Mất thì xin bản sao tại đó."},
  tokhai:{name:"Tờ khai thuế thu nhập cá nhân, lệ phí trước bạ", why:"Để cơ quan thuế tính và thông báo số tiền phải nộp hoặc được miễn.", where:"Bên em soạn sẵn, anh chị chỉ cần ký."},
  mienthue:{name:"Giấy tờ chứng minh được miễn thuế, lệ phí", why:"Chuyển nhượng, tặng cho, thừa kế giữa vợ chồng, cha mẹ với con, anh chị em ruột... thường được miễn thuế TNCN và lệ phí trước bạ.", where:"Giấy khai sinh, đăng ký kết hôn hoặc giấy tờ xác nhận quan hệ."},
  donxin:{name:"Đơn đăng ký / đơn đề nghị theo mẫu", why:"Mẫu đơn bắt buộc của thủ tục.", where:"Bên em điền sẵn theo thông tin anh chị cung cấp."},
  matso:{name:"Giấy tờ về việc mất sổ", why:"Cấp lại do mất sổ phải có thông tin xác nhận việc mất giấy.", where:"Đơn trình báo mất giấy tờ, bên em hướng dẫn nộp tại công an xã, phường."},
  giapranh:{name:"Thông tin liên hệ các hộ giáp ranh", why:"Khi đo, các hộ liền kề cần có mặt ký xác nhận ranh giới.", where:"Anh chị báo trước lịch đo cho hàng xóm."},
  anhht:{name:"Ảnh hiện trạng nhà đất", why:"Giúp đánh giá sơ bộ trước khi xuống hiện trường.", where:"Chụp bằng điện thoại: mặt tiền, đường vào, các góc ranh."},
  thuadat:{name:"Số tờ, số thửa, địa chỉ thửa đất", why:"Để tra cứu quy hoạch, giá đất, thông tin địa chính.", where:"Xem ở trang 2 sổ đỏ. Chưa có sổ thì gửi vị trí Google Maps."},
  banve:{name:"Bản vẽ thiết kế", why:"Thành phần bắt buộc của hồ sơ xin phép xây dựng.", where:"Đơn vị thiết kế có năng lực lập. Bên em có thể kết nối."},
  camket:{name:"Cam kết an toàn công trình liền kề", why:"Cần khi xây sát nhà bên cạnh, có tầng hầm hoặc công trình lớn.", where:"Bên em hướng dẫn theo quy mô công trình."},
  gpxd:{name:"Giấy phép xây dựng", why:"Chỉ thi công khi công trình đã có phép, trừ trường hợp được miễn phép.", where:"Làm cùng dịch vụ 09 Xin phép xây dựng."},
  nhucau:{name:"Nhu cầu, ngân sách, khu vực mong muốn", why:"Lọc nguồn phù hợp, tránh mất công xem nơi không hợp.", where:"Điền ở phần thông tin chi tiết."},
  benkia:{name:"Bản sao giấy tờ bên kia cung cấp", why:"Kiểm tra pháp lý trước khi đặt cọc, ký hợp đồng.", where:"Xin bên bán, bên cho thuê ảnh chụp sổ đỏ và căn cước."},
  coc:{name:"Hợp đồng / giấy đặt cọc đã ký", why:"Rà soát điều khoản phạt cọc, thời hạn, nghĩa vụ các bên.", where:"Bản anh chị đang giữ."},
  sukien:{name:"Mô tả sự việc cần lập vi bằng", why:"Thừa phát lại cần biết thời gian, địa điểm, sự kiện cần ghi nhận.", where:"Điền ở phần thông tin chi tiết."},
  uyquyen:{name:"Văn bản ủy quyền", why:"Người không trực tiếp đi làm được thì ủy quyền cho người khác.", where:"Lập tại văn phòng công chứng; ở nước ngoài thì qua cơ quan đại diện Việt Nam."},
  chungcu:{name:"Tài liệu liên quan đến tranh chấp", why:"Biên bản, đơn từ, tin nhắn, ảnh... làm chứng cứ.", where:"Tập hợp toàn bộ giấy tờ đang giữ."},
  hoagiai:{name:"Biên bản hòa giải tại UBND xã, phường", why:"Tranh chấp về người có quyền sử dụng đất phải hòa giải ở cấp xã trước khi khởi kiện.", where:"Bên em hỗ trợ soạn và nộp đơn yêu cầu hòa giải."},
  thechap:{name:"Giấy tờ xóa thế chấp", why:"Sổ còn đăng ký thế chấp thì không sang tên được.", where:"Ngân hàng cấp sau khi tất toán khoản vay; bên em làm thủ tục xóa đăng ký."},
  vuviec:{name:"Tóm tắt vụ việc cần tư vấn", why:"Luật sư đọc trước để buổi tư vấn đi thẳng vào vấn đề, tiết kiệm thời gian và chi phí.", where:"Điền ở phần thông tin chi tiết, hoặc gửi qua Zalo trước buổi hẹn."},
  lienquan:{name:"Giấy tờ liên quan đến việc cần làm", why:"Để xác định đúng thủ tục và nơi nộp.", where:"Gửi ảnh chụp các giấy tờ đang có."}
};

/* need: 1 = bắt buộc, 2 = tùy trường hợp. note = ghi chú riêng cho dịch vụ */
const GROUPS = ["Thừa kế & Sổ đỏ","Đo đạc, Định giá & Quy hoạch","Xây dựng","Giao dịch nhà đất","Pháp lý hỗ trợ","Dịch vụ công"];

const SERVICES = [
  {no:1,g:0,title:"Thừa kế quyền sử dụng đất, nhà ở",desc:"Khai nhận, phân chia di sản khi có hoặc không có di chúc, rồi đăng ký sang tên.",days:[30,60],extra:"Thuế, phí, lệ phí nhà nước; phí công chứng",
    docs:[["gcn",1],["dichuc",2],["tuchoi",2],["tokhai",1],["mienthue",2]],
    fields:[["thongnhat","Những người thừa kế đã thống nhất cách chia chưa?","select",["Đã thống nhất","Chưa bàn","Chưa thống nhất","Đang tranh chấp"]],["muonchia","Muốn chia thế nào","select",["Chia đều theo pháp luật","Dồn cho một người đứng tên","Bán rồi chia tiền","Chưa quyết định"]]]},
  {no:2,g:0,title:"Cấp sổ đỏ lần đầu",desc:"Đất chưa có giấy chứng nhận: rà soát nguồn gốc, lập hồ sơ, theo dõi đến khi nhận sổ.",days:[30,90],extra:"Tiền sử dụng đất (nếu có); thuế, phí, lệ phí",
    docs:[["donxin",1],["nguongoc",2],["bienlai",2],["trichdo",1]],
    fields:[["dientich","Diện tích ước tính (m²)","number","120"],["loaidat","Loại đất đang dùng","select",["Đất ở","Đất vườn, ao","Đất nông nghiệp","Chưa rõ"]],["tunam","Sử dụng từ năm","number","1995"],["tranhchap","Có tranh chấp không","select",["Không","Có"]]]},
  {no:3,g:0,title:"Sang tên sổ đỏ",desc:"Sau khi đã công chứng mua bán, tặng cho, thừa kế: kê khai thuế và đăng ký biến động.",days:[10,30],extra:"Thuế TNCN, lệ phí trước bạ (nếu không được miễn)",
    docs:[["gcn",1],["hopdong",1],["tokhai",1],["mienthue",2],["thechap",2],["donxin",1]],
    fields:[["loaigd","Loại giao dịch","select",["Mua bán","Tặng cho","Thừa kế"]],["quanhe_gd","Quan hệ giữa hai bên","select",["Không họ hàng","Cha mẹ và con","Vợ chồng","Anh chị em ruột","Ông bà và cháu"]],["giatri","Giá trị ghi trên hợp đồng (đồng)","text","2.500.000.000"]]},
  {no:4,g:0,title:"Cấp đổi, cấp lại sổ đỏ",desc:"Sổ cũ, rách, sai thông tin hoặc bị mất cần đổi, cấp lại.",days:[10,45],extra:"Phí, lệ phí nhà nước",
    docs:[["gcn",2,"Bản gốc sổ cũ (khi cấp đổi)"],["donxin",1],["matso",2,"Khi cấp lại do mất sổ"],["trichdo",2,"Khi diện tích thực tế khác sổ"]],
    fields:[["lydo","Lý do","select",["Sổ cũ, rách, nhòe","Sai thông tin","Mất sổ","Đổi sang mẫu mới","Diện tích thay đổi"]]]},
  {no:5,g:1,title:"Đo đạc địa chính",desc:"Đo vẽ, cắm mốc, trích đo thửa đất; xử lý chênh lệch diện tích.",days:[5,15],extra:"Phí trích lục, xác nhận của cơ quan nhà nước (nếu có)",
    docs:[["gcn",2,"Hoặc giấy tờ đất đang có"],["anhht",2]],
    fields:[["dientich","Diện tích ước tính (m²)","number","150"],["mucdich_do","Đo để làm gì","select",["Cấp sổ lần đầu","Tách thửa","Xác định ranh giới","Chênh lệch diện tích","Mua bán"]]]},
  {no:6,g:1,title:"Định giá bất động sản",desc:"Xác định giá trị để mua bán, thế chấp, chia tài sản.",days:[3,7],extra:"Không",
    docs:[["thuadat",1],["gcn",2,"Bản sao"],["anhht",1]],
    fields:[["mucdich_dg","Mục đích định giá","select",["Mua bán","Thế chấp vay vốn","Chia tài sản","Tham khảo"]],["loaits","Loại tài sản","select",["Đất trống","Nhà và đất","Căn hộ"]]]},
  {no:7,g:1,title:"Kiểm tra quy hoạch",desc:"Tra cứu thửa đất có nằm trong quy hoạch, lộ giới, hành lang an toàn hay không.",days:[3,10],extra:"Phí cung cấp thông tin (nếu có)",
    docs:[["thuadat",1],["gcn",2,"Bản sao"]],
    fields:[["mucdich_qh","Kiểm tra để làm gì","select",["Chuẩn bị mua","Chuẩn bị xây","Kiểm tra đất đang có"]]]},
  {no:8,g:1,title:"Chuyển đổi mục đích sử dụng đất",desc:"Chuyển đất nông nghiệp, đất vườn sang đất ở; tính trước tiền sử dụng đất.",days:[30,60],extra:"Tiền sử dụng đất; phí, lệ phí nhà nước",
    docs:[["gcn",1],["donxin",1],["thuadat",1],["trichdo",2]],
    fields:[["tu","Đang là đất","select",["Đất nông nghiệp","Đất vườn","Đất ao"]],["sang","Muốn chuyển sang","select",["Đất ở","Đất thương mại, dịch vụ"]],["dtcd","Diện tích muốn chuyển (m²)","number","100"]]},
  {no:9,g:2,title:"Xin phép xây dựng",desc:"Lập hồ sơ cấp phép xây nhà ở riêng lẻ, sửa chữa, cải tạo.",days:[20,45],extra:"Lệ phí cấp phép; chi phí thiết kế",
    docs:[["gcn",1,"Bản sao có chứng thực"],["banve",1],["donxin",1],["camket",2]],
    fields:[["loaict","Loại công trình","select",["Xây mới","Cải tạo, sửa chữa"]],["sotang","Số tầng dự kiến","number","3"],["dtsan","Tổng diện tích sàn (m²)","number","240"]]},
  {no:10,g:2,title:"Nhận thầu xây dựng, cải tạo",desc:"Xây mới, sửa nhà, cải tạo trọn gói hoặc từng hạng mục.",days:[60,240],extra:"Vật tư, nhân công theo dự toán",
    docs:[["anhht",1],["nhucau",1],["gpxd",2],["banve",2]],
    fields:[["hangmuc","Hạng mục","select",["Xây mới trọn gói","Phần thô","Cải tạo","Sửa chữa nhỏ"]],["ngansach","Ngân sách dự kiến","text","1,2 tỷ"],["batdau","Muốn khởi công khoảng","date",""]]},
  {no:11,g:3,title:"Mua bán nhà đất",desc:"Tìm nguồn, kiểm tra pháp lý, đặt cọc, công chứng, sang tên.",days:[30,90],extra:"Phí công chứng; thuế, phí, lệ phí nhà nước",
    docs:[["nhucau",1],["benkia",2],["gcn",2,"Nếu anh chị là bên bán"],["coc",2]],
    fields:[["vaitro","Anh chị là","select",["Bên mua","Bên bán"]],["ngansach","Ngân sách / giá mong muốn","text","3 tỷ"],["kvmong","Khu vực mong muốn","text","Phường Long Biên"]]},
  {no:12,g:3,title:"Đàm phán",desc:"Cùng anh chị thương lượng giá, điều khoản đặt cọc và thời hạn giao dịch.",days:[3,14],extra:"Không",
    docs:[["benkia",1],["coc",2],["nhucau",1]],
    fields:[["vande","Đang vướng ở điểm nào","textarea","Hai bên chênh giá 200 triệu, chưa thống nhất thời hạn giao sổ"]]},
  {no:13,g:3,title:"Thuê nhà",desc:"Tìm nhà thuê, cho thuê; soạn và rà soát hợp đồng thuê.",days:[3,14],extra:"Không",
    docs:[["nhucau",1],["benkia",2,"Sổ đỏ hoặc giấy tờ chứng minh quyền cho thuê"]],
    fields:[["vaitro_thue","Anh chị là","select",["Bên thuê","Bên cho thuê"]],["giathue","Giá thuê mong muốn / tháng","text","8 triệu"],["thoihan","Thời hạn thuê","text","2 năm"]]},
  {no:14,g:4,title:"Vi bằng",desc:"Kết nối thừa phát lại lập vi bằng: giao nhận tiền, hiện trạng nhà, thông báo.",days:[1,5],extra:"Phí thừa phát lại",
    docs:[["sukien",1],["lienquan",2]],
    fields:[["loaivb","Việc cần lập vi bằng","select",["Giao nhận tiền, đặt cọc","Hiện trạng nhà trước khi xây, sửa","Thông báo, giao nhận giấy tờ","Khác"]],["ngayvb","Ngày dự kiến","date",""]]},
  {no:15,g:4,title:"Công chứng",desc:"Chuẩn bị hồ sơ, đặt lịch công chứng hợp đồng, di chúc, ủy quyền.",days:[1,5],extra:"Phí công chứng theo quy định",
    docs:[["gcn",1],["donxin",1,"Phiếu yêu cầu công chứng"]],
    fields:[["loaicc","Loại văn bản","select",["Hợp đồng mua bán","Hợp đồng tặng cho","Di chúc","Ủy quyền","Khác"]]]},
  {no:16,g:4,title:"Giải quyết tranh chấp đất đai, nhà cửa",desc:"Tư vấn hướng xử lý, hỗ trợ hòa giải ở cơ sở, kết nối luật sư khi cần.",days:[30,180],extra:"Phí luật sư, án phí (nếu có)",
    docs:[["gcn",2,"Giấy tờ đất của các bên"],["chungcu",1],["hoagiai",2]],
    fields:[["loaitc","Loại tranh chấp","select",["Ranh giới, lối đi","Thừa kế","Mua bán, đặt cọc","Khác"]],["dahg","Đã hòa giải ở xã chưa","select",["Chưa","Đã hòa giải, không thành"]],["diendien","Tóm tắt diễn biến","textarea","Nhà bên cạnh xây lấn 0,5 m sang đất nhà tôi từ năm 2023..."]]},
  {no:18,g:4,title:"Tư vấn trực tiếp với luật sư",desc:"Chọn luật sư hợp tác với Vua Mặt Phố, đặt lịch tư vấn qua điện thoại, video hoặc gặp tại văn phòng. Phí theo bảng giá từng luật sư.",days:[1,3],extra:"Phí soạn văn bản, đại diện tham gia tố tụng (nếu có) báo riêng",
    docs:[["vuviec",1],["cccd",2],["lienquan",2,"Ảnh chụp giấy tờ liên quan vụ việc"]],
    fields:[["linhvuc","Lĩnh vực cần tư vấn","select",["Đất đai, sổ đỏ","Thừa kế","Mua bán, đặt cọc","Tranh chấp","Xây dựng","Khác"]],["cauhoi","Câu hỏi chính muốn hỏi luật sư","textarea","Bố tôi mất không để lại di chúc, anh cả đang giữ sổ đỏ và không chịu chia..."]]},
  {no:17,g:5,title:"Dịch vụ công đất đai, nhà cửa",desc:"Nộp hồ sơ trực tuyến, xin trích lục, trích sao, xác nhận thông tin.",days:[3,15],extra:"Phí, lệ phí nhà nước",
    docs:[["cccd",1],["lienquan",1],["thuadat",2]],
    fields:[["viec","Việc cần làm","text","Xin trích lục bản đồ thửa đất"]]}
];

/* Combo: services = các dịch vụ trong gói; free = dịch vụ được tặng (tính 0 đồng);
   discount = % giảm trên phí các dịch vụ còn lại (anh điền số, null = không giảm) */
const COMBOS = [
  {id:"C1",name:"Thừa kế trọn gói",for:"Đất bố mẹ để lại, cần chia và đứng tên",services:[1,15,3,7],free:7,discount:null,gift:"Tặng kiểm tra quy hoạch thửa đất trước khi chia"},
  {id:"C2",name:"Sổ đỏ lần đầu",for:"Đất ở lâu năm, chưa có sổ",services:[5,2,7],free:7,discount:null,gift:"Tặng kiểm tra quy hoạch, biết trước phần đất bị vướng"},
  {id:"C3",name:"Mua đất an toàn",for:"Người mua muốn chắc chắn pháp lý trước khi xuống tiền",services:[7,5,12,14,15,3],free:14,discount:null,gift:"Tặng lập vi bằng giao nhận tiền cọc (phí thừa phát lại vẫn tính riêng)"},
  {id:"C4",name:"Bán nhà nhanh, đúng giá",for:"Chủ nhà cần bán, muốn định giá và làm giấy tờ gọn",services:[6,11,15],free:6,discount:null,gift:"Tặng định giá bất động sản trước khi rao bán"},
  {id:"C5",name:"Làm nhà mới",for:"Có đất, chuẩn bị xây nhà",services:[7,9,10],free:9,discount:null,gift:"Tặng phí dịch vụ xin phép xây dựng khi ký hợp đồng thi công"}
];

const STATUSES = ["Mới","Đã gọi tư vấn","Chờ bổ sung giấy tờ","Đang xử lý","Hoàn thành","Tạm dừng"];

/* 34 tỉnh, thành phố (theo đơn vị hành chính từ 01/7/2025) */
const PROVINCES = ["Hà Nội","TP Hồ Chí Minh","Hải Phòng","Đà Nẵng","Cần Thơ","Huế",
  "An Giang","Bắc Ninh","Cà Mau","Cao Bằng","Đắk Lắk","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Tĩnh",
  "Hưng Yên","Khánh Hòa","Lai Châu","Lâm Đồng","Lạng Sơn","Lào Cai","Nghệ An","Ninh Bình","Phú Thọ","Quảng Ngãi",
  "Quảng Ninh","Quảng Trị","Sơn La","Tây Ninh","Thái Nguyên","Thanh Hóa","Tuyên Quang","Vĩnh Long"];

/* Loại văn phòng. svc = các dịch vụ hay cần đến loại văn phòng này */
const OFFICE_TYPES = {
  vmp:{name:"Văn phòng Vua Mặt Phố", svc:[]},
  cc:{name:"Văn phòng công chứng", svc:[1,3,11,15]},
  ls:{name:"Văn phòng luật sư, công ty luật", svc:[1,12,16]},
  tpl:{name:"Văn phòng thừa phát lại", svc:[14]},
  dd:{name:"Đơn vị đo đạc", svc:[2,5,7,8]},
  xd:{name:"Nhà thầu xây dựng", svc:[9,10]}
};

/* DANH BẠ VĂN PHÒNG — anh thay các dòng "(mẫu)" bằng văn phòng thật.
   lat, lng: tọa độ trên Google Maps (giữ ngón tay lên điểm trên bản đồ → hiện 2 số, ví dụ 21.0285, 105.8542).
   services: dịch vụ văn phòng này nhận (dùng để phân quyền xem hồ sơ). */
const OFFICES = [
  {id:"VMP-HN", type:"vmp", name:"Vua Mặt Phố – Văn phòng Hà Nội", province:"Hà Nội", address:"[địa chỉ văn phòng, đang cập nhật]", phone:"0911 530 000", hours:"Thứ 2 – Thứ 7, 8h00 – 17h30", lat:null, lng:null, services:[]},
  {id:"CC-HN-1", type:"cc", name:"Văn phòng công chứng (mẫu) – Hà Nội", province:"Hà Nội", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 7", lat:null, lng:null, services:[1,3,15]},
  {id:"LS-HN-1", type:"ls", name:"Văn phòng luật sư (mẫu) – Hà Nội", province:"Hà Nội", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 6", lat:null, lng:null, services:[16]},
  {id:"DD-HN-1", type:"dd", name:"Đơn vị đo đạc (mẫu) – Hà Nội", province:"Hà Nội", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 7", lat:null, lng:null, services:[5,7]},
  {id:"TPL-HN-1", type:"tpl", name:"Văn phòng thừa phát lại (mẫu) – Hà Nội", province:"Hà Nội", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 7", lat:null, lng:null, services:[14]},
  {id:"XD-HN-1", type:"xd", name:"Nhà thầu xây dựng (mẫu) – Hà Nội", province:"Hà Nội", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Chủ nhật", lat:null, lng:null, services:[9,10]},
  {id:"CC-HCM-1", type:"cc", name:"Văn phòng công chứng (mẫu) – TP Hồ Chí Minh", province:"TP Hồ Chí Minh", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 7", lat:null, lng:null, services:[1,3,15]},
  {id:"LS-HCM-1", type:"ls", name:"Công ty luật (mẫu) – TP Hồ Chí Minh", province:"TP Hồ Chí Minh", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 6", lat:null, lng:null, services:[16]},
  {id:"CC-DN-1", type:"cc", name:"Văn phòng công chứng (mẫu) – Đà Nẵng", province:"Đà Nẵng", address:"[địa chỉ]", phone:"", hours:"Thứ 2 – Thứ 7", lat:null, lng:null, services:[1,3,15]}
];

/* Cách khách nộp hồ sơ */
const VISIT = {
  zalo:"Gửi ảnh giấy tờ qua Zalo trước",
  home:"Nhân viên đến tận nơi nhận hồ sơ",
  office:"Tự đến văn phòng nộp hồ sơ"
};
