(() => {
  'use strict';

  const en = {
    skip: 'Skip to tool', language: 'Language', navOverview: 'Overview', navTool: 'Tool', navSafety: 'Safety', navGuide: 'Specs', eyebrow: 'LOCAL PRIVACY TOOL',
    lead: 'Photos, images, audio and video stay untouched. Zero only the data you do not want.',
    intro: 'Remove GPS, capture time, device names and more without sending files outside, then create a new file in the same format.',
    trustLocal: 'No uploads', trustFormat: 'Same file format', trustOriginal: 'Original stays untouched',
    localBadge: 'Processed only on this device', toolTitle: 'Remove data and save a new copy',
    saveDestination: 'Save destination', folderUnset: 'Not selected', chooseFolder: 'Choose folder',
    folderNote: 'On PC, choose a destination once and new copies are written there after processing.',
    folderFallback: 'Your browser will use its normal save function after processing.',
    dropTitle: 'Drop images, audio or videos here', dropSub: 'or click to select', limits: 'JPEG / PNG / WebP up to 10 · MP3 up to 10 · MP4 / MOV up to 3 total',
    selectedFiles: 'Selected files', clear: 'Clear all', processing: 'Processing', processButton: 'Remove data and save', cancel: 'Cancel',
    outputNote: 'Adds .mz to the original name and saves multiple files one by one to your default downloads.',
    privacyTitle: 'Data removed and content retained', removeHeading: 'Data removed', removeText: 'META ZERO removes GPS and location, dates, creator and user names, copyright, device, camera and software names, detectable user, device and document IDs, titles, comments, site names and URLs, original file names, detectable IP address data and other internal metadata. Supported files are processed regardless of whether they come from Canva, Adobe Photoshop, Adobe Premiere Pro or another tool.',
    keepHeading: 'What stays unchanged', keepText: 'Image pixels, audio/video content and the original files remain unchanged. Color profiles and the orientation data needed to keep portrait and landscape media from appearing rotated or upside down are retained.',
    noticeHeading: 'Support & limits', noticeText: 'Information contained in the media itself, such as faces, addresses or text visible in images or video, and voices or conversations in audio, cannot be removed. Saved file names also remain. Even in supported formats, complete removal cannot be guaranteed for undetectable information in private software-specific areas or encoder identifiers embedded in compressed data.',
    networkNotice: 'Detectable IP address data stored inside the file is removed and is not added to the new file. An upload destination may separately collect and manage the source IP address in access logs when the file is sent. That information is separate from file metadata and is outside META ZERO\'s processing and control.',
    metaIpAddress: 'IP ADDRESS',
    keepFormat: 'Keeps JPEG / PNG / WebP / MP3 / MP4 / MOV format', keepMedia: 'Keeps image, audio and video media without recompression', keepOriginal: 'Creates a new copy without changing the original',
    colorNote: 'ICC color profiles and only the orientation data needed to display the image upright are retained.',
    specInput: 'INPUT', specOutput: 'OUTPUT', specOutputValue: 'Original format · original-name.mz.ext', specCount: 'LIMIT', specCountValue: '10 images / 10 MP3 files / 3 MP4 or MOV files total', specSave: 'SAVE', specSaveValue: 'Multiple files download one by one', legal: 'Commercial Transactions Act',
    keycraftEyebrow: 'WINDOWS APP', keycraftTitle: 'Advanced META ZERO is built into KeyCraft.', keycraftText: 'Expanded image, audio and video format support with stronger batch processing, included in a free Windows shortcut tool.', keycraftButton: 'Download on BOOTH',
    footer: 'Files stay on your device.', backToTop: 'Back to top', multipleDownloadHint: 'Files will download one by one. If your browser asks, allow multiple downloads.',
    statusReady: 'Ready', statusScanning: 'Reading', statusProcessing: 'Removing data', statusDone: 'Saved', statusError: 'Failed',
    metadataFound: '{count} metadata type(s) ({targets})', metadataNone: 'No removable metadata found', sizeLabel: '{size}', durationLabel: '{duration}',
    folderUnsupported: 'Folder writing is not supported in this browser.', folderSelected: 'Save to: {name}', folderDenied: 'Folder access was not granted.',
    invalidType: 'Only JPEG, PNG, WebP, MP3, MP4 and MOV are supported.', imageLimit: 'You can select up to 10 images.', videoLimit: 'You can select up to 3 MP4 or MOV files in total.', audioLimit: 'You can select up to 10 MP3 files.',
    duplicateSkipped: 'Duplicate files were skipped.', noFiles: 'Select at least one file.', pickFolderFirst: 'Choose a save folder first.',
    savedFiles: '{count} new file(s) saved.', someFailed: '{done} saved, {failed} failed.', cancelled: 'Processing cancelled.', saveFailed: 'Could not save this file.',
    processingItem: '{current}/{total} {name}', removeFileLabel: 'Remove {name}', fallbackSave: 'Using the browser save function.',
    metaExif: 'EXIF / GPS', metaXmp: 'XMP', metaComment: 'Comments', metaText: 'Text / time', metaMp4: 'MP4 metadata', metaId3: 'ID3 metadata', metaApe: 'APE metadata', metaTime: 'Creation time'
  };

  const ja = {
    skip: 'ツールへ移動', language: '言語', navOverview: '概要', navTool: '機能', navSafety: '安全性', navGuide: '仕様', eyebrow: 'LOCAL PRIVACY TOOL', lead: '写真・画像・音声・動画はそのまま。残したくない情報だけをゼロへ。',
    intro: 'GPS、撮影日時、端末名などを外部へ送らず除去し、同じ形式の新しいファイルを作ります。',
    trustLocal: 'アップロードなし', trustFormat: '同じ形式のまま', trustOriginal: '元ファイルは変更しない', localBadge: 'この端末内だけで処理', toolTitle: '情報だけ除去して新規保存',
    saveDestination: '保存先', folderUnset: '未選択', chooseFolder: 'フォルダを選ぶ', folderNote: 'PCでは保存先を一度選ぶと、処理後に新しいコピーを直接作成します。', folderFallback: '処理後はブラウザの通常保存を使用します。',
    dropTitle: '画像・音声・動画をここへドロップ', dropSub: 'またはクリックして選択', limits: 'JPEG / PNG / WebP 最大10枚・MP3 最大10本・動画（MP4 / MOV）最大3本', selectedFiles: '選択したファイル', clear: 'すべて解除', processing: '処理中', processButton: '情報を除去して保存', cancel: '中止', outputNote: '元の名前に .mz を付け、複数も1件ずつ既定のダウンロード先へ保存します。',
    privacyTitle: '消す情報と、変えない中身', removeHeading: '除去する情報', removeText: 'GPS・位置情報、日時、作成者・ユーザー名、著作権、端末・カメラ・ソフト名、検出可能なユーザー・端末・文書ID、タイトル・コメント、サイト名・サイトURL、元ファイル名、IPアドレス情報などを削除します。Canva、Adobe Photoshop、Adobe Premiere Proなど、作成ツールを問わず対応形式を処理します。', keepHeading: '変えないもの', keepText: '画像の画素、音声・動画データ、元ファイルは変更しません。縦向き・横向きの画像や動画が回転・逆さまにならず正しく表示されるための向き情報と、カラープロファイルは残します。', noticeHeading: '対応と注意', noticeText: '画像・動画に写り込んだ顔・住所・画面内文字や、音声に収録された声・会話など、画像・動画・音声そのものに含まれる情報と、保存後のファイル名は消せません。対応形式でも、ソフト独自の非公開領域など検出できない情報や、圧縮データ内のエンコーダー識別子は完全な除去を保証できません。',
    networkNotice: 'ファイル内部の検出可能なIPアドレス情報は除去し、新しいファイルにも追加しません。ただし、アップロード先のサービスが送信時のIPアドレスをアクセスログなどとして取得・管理する場合があります。これはファイル内部のメタデータとは別の情報で、META ZEROの処理・管理対象外です。',
    metaIpAddress: 'IPアドレス',
    keepFormat: 'JPEG / PNG / WebP / MP3 / MP4 / MOVの形式を維持', keepMedia: '再圧縮せず、画像・音声・映像本体を維持', keepOriginal: '元ファイルは変更せず新しいコピーを作成', colorNote: '画像の色を保ち、本来の縦向き・横向きで逆さまにならず表示されるよう、ICCカラープロファイルと表示方向に必要な情報だけは残します。',
    specInput: '入力', specOutput: '出力', specOutputValue: '元形式・元名.mz.ext', specCount: '一括処理上限', specCountValue: '画像10枚 / MP3 10本 / 動画（MP4 / MOV）3本', specSave: '保存', specSaveValue: '複数も1件ずつ順番に保存', legal: '特定商取引法に基づく表記', footer: 'ファイルは端末の外へ送信されません。', backToTop: 'TOPに戻る', multipleDownloadHint: '1件ずつ順番に保存します。ブラウザに確認された場合は複数ダウンロードを許可してください。',
    keycraftEyebrow: 'WINDOWS APP', keycraftTitle: '高機能版META ZEROは、KeyCraftに搭載。', keycraftText: '画像・音声・動画の対応形式と複数処理をさらに強化。無料のショートカット作成ツールと一緒に、PC内で使えます。', keycraftButton: 'BOOTHでダウンロード',
    statusReady: '準備完了', statusScanning: '確認中', statusProcessing: '情報を除去中', statusDone: '保存済み', statusError: '失敗', metadataFound: '除去対象 {count}種類（{targets}）', metadataNone: '除去対象の情報は未検出', sizeLabel: '{size}', durationLabel: '{duration}',
    folderUnsupported: 'このブラウザはフォルダへの直接保存に未対応です。', folderSelected: '保存先：{name}', folderDenied: 'フォルダへのアクセスが許可されませんでした。', invalidType: 'JPEG、PNG、WebP、MP3、MP4、MOVのみ対応しています。', imageLimit: '画像は最大10枚まで選択できます。', videoLimit: 'MP4またはMOVは最大3本まで選択できます。', audioLimit: 'MP3は最大10本まで選択できます。', duplicateSkipped: '重複したファイルは追加しませんでした。', noFiles: 'ファイルを選択してください。', pickFolderFirst: '先に保存先フォルダを選んでください。', savedFiles: '新しいファイルを {count} 件保存しました。', someFailed: '{done}件保存、{failed}件失敗しました。', cancelled: '処理を中止しました。', saveFailed: 'このファイルを保存できませんでした。', processingItem: '{current}/{total} {name}', removeFileLabel: '{name}を解除', fallbackSave: 'ブラウザの通常保存を使用します。',
    metaExif: 'GPS・撮影情報', metaXmp: 'サイトデータ・作成者情報', metaComment: 'コメント', metaText: '文字情報・日時', metaMp4: '動画情報', metaId3: '曲名・作成者情報', metaApe: '音声タグ情報', metaTime: '作成日時'
  };

  const overrides = {
    'zh-CN': {
      skip:'跳转到工具',language:'语言',navOverview:'概览',navTool:'功能',navSafety:'安全',navGuide:'规格',lead:'保留照片和视频，只清除不想留下的信息。',intro:'无需向外发送文件，即可删除 GPS、拍摄时间、设备名称等，并以相同格式创建新文件。',trustLocal:'无需上传',trustFormat:'保持原格式',trustOriginal:'不修改原文件',localBadge:'仅在本设备处理',toolTitle:'只删除信息并保存新副本',saveDestination:'保存位置',folderUnset:'未选择',chooseFolder:'选择文件夹',folderNote:'在电脑上选择一次保存位置，处理后会直接创建新副本。',folderFallback:'处理后使用浏览器的常规保存功能。',dropTitle:'将图片或视频拖到这里',dropSub:'或点击选择',limits:'JPEG / PNG / WebP 最多10张 · MP4 最多3个',selectedFiles:'已选文件',clear:'全部清除',processing:'处理中',processButton:'删除信息并保存',cancel:'取消',outputNote:'在原文件名后添加 .mz，并逐个保存到默认下载位置。',removeHeading:'删除的信息',removeText:'位置、拍摄时间、设备和软件名称、备注及标准图片/MP4元数据。',keepHeading:'保持不变',keepText:'图像像素、视频/音频数据和原文件。保留正确显示所需的颜色与方向信息。',noticeHeading:'支持与限制',noticeText:'支持 JPEG / PNG / WebP / MP4。无法删除画面中的人脸、地址或网络 IP 地址。',footer:'文件不会离开您的设备。',statusReady:'就绪',statusScanning:'读取中',statusProcessing:'正在删除信息',statusDone:'已保存',statusError:'失败',metadataFound:'发现 {count} 类元数据',metadataNone:'未发现可删除的元数据',folderUnsupported:'此浏览器不支持直接写入文件夹。',folderSelected:'保存到：{name}',folderDenied:'未获得文件夹访问权限。',invalidType:'仅支持 JPEG、PNG、WebP 和 MP4。',imageLimit:'最多可选择10张图片。',videoLimit:'最多可选择3个 MP4。',duplicateSkipped:'已跳过重复文件。',noFiles:'请至少选择一个文件。',pickFolderFirst:'请先选择保存文件夹。',savedFiles:'已保存 {count} 个新文件。',someFailed:'已保存 {done} 个，失败 {failed} 个。',cancelled:'已取消处理。',saveFailed:'无法保存此文件。',processingItem:'{current}/{total} {name}',removeFileLabel:'移除 {name}',fallbackSave:'使用浏览器常规保存。',metaComment:'备注',metaText:'文本 / 时间',metaMp4:'MP4 元数据',metaTime:'创建时间'
    },
    'zh-TW': {
      skip:'跳至工具',language:'語言',navOverview:'概要',navTool:'功能',navSafety:'安全性',navGuide:'規格',lead:'保留照片與影片，只清除不想留下的資訊。',intro:'不將檔案傳到外部，即可移除 GPS、拍攝時間、裝置名稱等，並以相同格式建立新檔案。',trustLocal:'無需上傳',trustFormat:'維持原格式',trustOriginal:'不修改原檔',localBadge:'僅在此裝置處理',toolTitle:'只移除資訊並儲存新副本',saveDestination:'儲存位置',folderUnset:'未選擇',chooseFolder:'選擇資料夾',folderNote:'在電腦上選一次儲存位置，處理後會直接建立新副本。',folderFallback:'處理後使用瀏覽器的一般儲存功能。',dropTitle:'將圖片或影片拖到這裡',dropSub:'或點擊選擇',limits:'JPEG / PNG / WebP 最多10張 · MP4 最多3個',selectedFiles:'已選檔案',clear:'全部清除',processing:'處理中',processButton:'移除資訊並儲存',cancel:'取消',outputNote:'一鍵儲存至瀏覽器預設下載位置：meta_zero.ext / meta_zero_01.ext …',removeHeading:'移除的資訊',removeText:'位置、拍攝時間、裝置與軟體名稱、註解及標準圖片/MP4中繼資料。',keepHeading:'保持不變',keepText:'影像像素、影片/音訊資料與原檔。保留正確顯示所需的色彩與方向資訊。',noticeHeading:'支援與限制',noticeText:'支援 JPEG / PNG / WebP / MP4。無法移除畫面中的人臉、地址或網路 IP 位址。',footer:'檔案不會離開您的裝置。',statusReady:'就緒',statusScanning:'讀取中',statusProcessing:'正在移除資訊',statusDone:'已儲存',statusError:'失敗',metadataFound:'發現 {count} 類中繼資料',metadataNone:'未發現可移除的中繼資料',folderUnsupported:'此瀏覽器不支援直接寫入資料夾。',folderSelected:'儲存至：{name}',folderDenied:'未取得資料夾存取權。',invalidType:'僅支援 JPEG、PNG、WebP 與 MP4。',imageLimit:'最多可選擇10張圖片。',videoLimit:'最多可選擇3個 MP4。',duplicateSkipped:'已略過重複檔案。',noFiles:'請至少選擇一個檔案。',pickFolderFirst:'請先選擇儲存資料夾。',savedFiles:'已儲存 {count} 個新檔案。',someFailed:'已儲存 {done} 個，失敗 {failed} 個。',cancelled:'已取消處理。',saveFailed:'無法儲存此檔案。',processingItem:'{current}/{total} {name}',removeFileLabel:'移除 {name}',fallbackSave:'使用瀏覽器一般儲存。',metaComment:'註解',metaText:'文字 / 時間',metaMp4:'MP4 中繼資料',metaTime:'建立時間'
    },
    ko: {
      skip:'도구로 이동',language:'언어',navOverview:'개요',navTool:'기능',navSafety:'안전',navGuide:'사양',lead:'사진과 영상은 그대로, 남기고 싶지 않은 정보만 지웁니다.',intro:'파일을 외부로 보내지 않고 GPS, 촬영 시간, 기기명 등을 제거한 뒤 같은 형식의 새 파일을 만듭니다.',trustLocal:'업로드 없음',trustFormat:'같은 파일 형식',trustOriginal:'원본 변경 없음',localBadge:'이 기기에서만 처리',toolTitle:'정보만 제거하고 새로 저장',saveDestination:'저장 위치',folderUnset:'선택 안 됨',chooseFolder:'폴더 선택',folderNote:'PC에서는 저장 위치를 한 번 선택하면 처리 후 새 복사본을 바로 만듭니다.',folderFallback:'처리 후 브라우저의 일반 저장 기능을 사용합니다.',dropTitle:'이미지 또는 영상을 여기에 놓기',dropSub:'또는 클릭하여 선택',limits:'JPEG / PNG / WebP 최대 10장 · MP4 최대 3개',selectedFiles:'선택한 파일',clear:'모두 지우기',processing:'처리 중',processButton:'정보 제거 후 저장',cancel:'취소',outputNote:'한 번의 클릭으로 브라우저 기본 다운로드 위치에 저장: meta_zero.ext / meta_zero_01.ext …',removeHeading:'제거하는 정보',removeText:'위치, 촬영 시간, 기기·소프트웨어명, 댓글 및 표준 이미지/MP4 메타데이터.',keepHeading:'변경하지 않는 것',keepText:'이미지 픽셀, 영상·음성 데이터와 원본 파일. 올바른 표시에 필요한 색상과 방향 정보는 유지합니다.',noticeHeading:'지원 및 제한',noticeText:'JPEG / PNG / WebP / MP4 지원. 화면 속 얼굴·주소와 네트워크 IP 주소는 지울 수 없습니다.',footer:'파일은 기기 밖으로 전송되지 않습니다.',statusReady:'준비 완료',statusScanning:'읽는 중',statusProcessing:'정보 제거 중',statusDone:'저장됨',statusError:'실패',metadataFound:'메타데이터 {count}종',metadataNone:'제거할 메타데이터 없음',folderUnsupported:'이 브라우저는 폴더 직접 저장을 지원하지 않습니다.',folderSelected:'저장 위치: {name}',folderDenied:'폴더 접근이 허용되지 않았습니다.',invalidType:'JPEG, PNG, WebP, MP4만 지원합니다.',imageLimit:'이미지는 최대 10장까지 선택할 수 있습니다.',videoLimit:'MP4는 최대 3개까지 선택할 수 있습니다.',duplicateSkipped:'중복 파일은 건너뛰었습니다.',noFiles:'파일을 하나 이상 선택하세요.',pickFolderFirst:'먼저 저장 폴더를 선택하세요.',savedFiles:'새 파일 {count}개를 저장했습니다.',someFailed:'{done}개 저장, {failed}개 실패.',cancelled:'처리를 취소했습니다.',saveFailed:'파일을 저장할 수 없습니다.',processingItem:'{current}/{total} {name}',removeFileLabel:'{name} 제거',fallbackSave:'브라우저 일반 저장을 사용합니다.',metaComment:'댓글',metaText:'텍스트 / 시간',metaMp4:'MP4 메타데이터',metaTime:'생성 시간'
    },
    es: {
      skip:'Ir a la herramienta',language:'Idioma',navOverview:'Resumen',navTool:'Herramienta',navSafety:'Seguridad',navGuide:'Especificaciones',lead:'Conserva la foto y el vídeo. Elimina solo los datos que no quieres.',intro:'Elimina GPS, fecha, dispositivo y más sin enviar archivos fuera, y crea una copia en el mismo formato.',trustLocal:'Sin subidas',trustFormat:'Mismo formato',trustOriginal:'Original intacto',localBadge:'Procesado solo en este dispositivo',toolTitle:'Eliminar datos y guardar copia',saveDestination:'Destino',folderUnset:'Sin seleccionar',chooseFolder:'Elegir carpeta',folderNote:'En PC, elige el destino una vez y las copias se guardarán allí.',folderFallback:'Tras procesar se usará el guardado normal del navegador.',dropTitle:'Suelta imágenes o vídeos aquí',dropSub:'o haz clic para elegir',limits:'JPEG / PNG / WebP hasta 10 · MP4 hasta 3',selectedFiles:'Archivos elegidos',clear:'Borrar todo',processing:'Procesando',processButton:'Eliminar datos y guardar',cancel:'Cancelar',outputNote:'Un clic guarda en las descargas predeterminadas: meta_zero.ext / meta_zero_01.ext …',removeHeading:'Datos eliminados',removeText:'Ubicación, fecha, dispositivo, software, comentarios y metadatos estándar de imagen/MP4.',keepHeading:'Sin cambios',keepText:'Píxeles, vídeo/audio y archivo original. Se conserva color y orientación para visualizar correctamente.',noticeHeading:'Compatibilidad y límites',noticeText:'JPEG / PNG / WebP / MP4. No elimina caras o direcciones visibles ni la IP de red.',footer:'Los archivos permanecen en tu dispositivo.',statusReady:'Listo',statusScanning:'Leyendo',statusProcessing:'Eliminando datos',statusDone:'Guardado',statusError:'Error',metadataFound:'{count} tipo(s) de metadatos',metadataNone:'Sin metadatos eliminables',folderUnsupported:'Este navegador no permite escribir directamente en carpetas.',folderSelected:'Guardar en: {name}',folderDenied:'No se concedió acceso a la carpeta.',invalidType:'Solo se admite JPEG, PNG, WebP y MP4.',imageLimit:'Puedes elegir hasta 10 imágenes.',videoLimit:'Puedes elegir hasta 3 MP4.',duplicateSkipped:'Se omitieron duplicados.',noFiles:'Elige al menos un archivo.',pickFolderFirst:'Elige primero una carpeta.',savedFiles:'Se guardaron {count} archivo(s) nuevos.',someFailed:'{done} guardados, {failed} fallidos.',cancelled:'Proceso cancelado.',saveFailed:'No se pudo guardar el archivo.',processingItem:'{current}/{total} {name}',removeFileLabel:'Quitar {name}',fallbackSave:'Se usa el guardado normal del navegador.',metaComment:'Comentarios',metaText:'Texto / fecha',metaMp4:'Metadatos MP4',metaTime:'Fecha de creación'
    },
    fr: {
      skip:'Aller à l’outil',language:'Langue',navOverview:'Aperçu',navTool:'Outil',navSafety:'Sécurité',navGuide:'Formats',lead:'Gardez la photo et la vidéo. Effacez seulement les données indésirables.',intro:'Supprimez GPS, date, appareil et plus sans envoyer les fichiers, puis créez une copie au même format.',trustLocal:'Aucun envoi',trustFormat:'Même format',trustOriginal:'Original intact',localBadge:'Traité uniquement sur cet appareil',toolTitle:'Supprimer les données et enregistrer',saveDestination:'Destination',folderUnset:'Non sélectionné',chooseFolder:'Choisir un dossier',folderNote:'Sur PC, choisissez une destination une fois pour y créer directement les nouvelles copies.',folderFallback:'L’enregistrement normal du navigateur sera utilisé après traitement.',dropTitle:'Déposez images ou vidéos ici',dropSub:'ou cliquez pour choisir',limits:'JPEG / PNG / WebP jusqu’à 10 · MP4 jusqu’à 3',selectedFiles:'Fichiers choisis',clear:'Tout effacer',processing:'Traitement',processButton:'Supprimer et enregistrer',cancel:'Annuler',outputNote:'Un clic enregistre dans les téléchargements par défaut : meta_zero.ext / meta_zero_01.ext …',removeHeading:'Données supprimées',removeText:'Lieu, date, appareil, logiciel, commentaires et métadonnées image/MP4 standard.',keepHeading:'Éléments inchangés',keepText:'Pixels, vidéo/audio et fichier original. Couleur et orientation nécessaires à l’affichage sont conservées.',noticeHeading:'Formats et limites',noticeText:'JPEG / PNG / WebP / MP4. Les visages ou adresses visibles et l’adresse IP réseau ne sont pas supprimés.',footer:'Les fichiers restent sur votre appareil.',statusReady:'Prêt',statusScanning:'Lecture',statusProcessing:'Suppression',statusDone:'Enregistré',statusError:'Échec',metadataFound:'{count} type(s) de métadonnées',metadataNone:'Aucune métadonnée à supprimer',folderUnsupported:'Ce navigateur ne permet pas l’écriture directe dans un dossier.',folderSelected:'Enregistrer dans : {name}',folderDenied:'Accès au dossier non accordé.',invalidType:'Seuls JPEG, PNG, WebP et MP4 sont acceptés.',imageLimit:'10 images maximum.',videoLimit:'3 MP4 maximum.',duplicateSkipped:'Doublons ignorés.',noFiles:'Choisissez au moins un fichier.',pickFolderFirst:'Choisissez d’abord un dossier.',savedFiles:'{count} nouveau(x) fichier(s) enregistré(s).',someFailed:'{done} enregistré(s), {failed} échec(s).',cancelled:'Traitement annulé.',saveFailed:'Impossible d’enregistrer ce fichier.',processingItem:'{current}/{total} {name}',removeFileLabel:'Retirer {name}',fallbackSave:'Enregistrement normal du navigateur.',metaComment:'Commentaires',metaText:'Texte / date',metaMp4:'Métadonnées MP4',metaTime:'Date de création'
    },
    de: {
      skip:'Zum Werkzeug',language:'Sprache',navOverview:'Übersicht',navTool:'Werkzeug',navSafety:'Sicherheit',navGuide:'Details',lead:'Foto und Video bleiben gleich. Nur unerwünschte Daten werden entfernt.',intro:'GPS, Aufnahmezeit, Gerätenamen und mehr lokal entfernen und eine neue Datei im selben Format erstellen.',trustLocal:'Kein Upload',trustFormat:'Gleiches Format',trustOriginal:'Original bleibt unverändert',localBadge:'Nur auf diesem Gerät verarbeitet',toolTitle:'Daten entfernen und Kopie speichern',saveDestination:'Speicherziel',folderUnset:'Nicht gewählt',chooseFolder:'Ordner wählen',folderNote:'Am PC einmal ein Ziel wählen; neue Kopien werden nach der Verarbeitung direkt dort erstellt.',folderFallback:'Nach der Verarbeitung wird die normale Browser-Speicherung verwendet.',dropTitle:'Bilder oder Videos hier ablegen',dropSub:'oder zum Auswählen klicken',limits:'JPEG / PNG / WebP bis 10 · MP4 bis 3',selectedFiles:'Ausgewählte Dateien',clear:'Alle entfernen',processing:'Verarbeitung',processButton:'Daten entfernen und speichern',cancel:'Abbrechen',outputNote:'Ein Klick speichert in den Standard-Downloads: meta_zero.ext / meta_zero_01.ext …',removeHeading:'Entfernte Daten',removeText:'Ort, Aufnahmezeit, Geräte-/Softwarenamen, Kommentare und übliche Bild-/MP4-Metadaten.',keepHeading:'Unverändert',keepText:'Bildpixel, Video-/Audiodaten und Originaldatei. Für die Anzeige nötige Farb- und Ausrichtungsdaten bleiben.',noticeHeading:'Formate & Grenzen',noticeText:'JPEG / PNG / WebP / MP4. Sichtbare Gesichter oder Adressen und die Netzwerk-IP werden nicht entfernt.',footer:'Dateien bleiben auf deinem Gerät.',statusReady:'Bereit',statusScanning:'Lesen',statusProcessing:'Daten werden entfernt',statusDone:'Gespeichert',statusError:'Fehler',metadataFound:'{count} Metadatentyp(en)',metadataNone:'Keine entfernbaren Metadaten',folderUnsupported:'Dieser Browser kann nicht direkt in Ordner schreiben.',folderSelected:'Speichern in: {name}',folderDenied:'Ordnerzugriff nicht gewährt.',invalidType:'Nur JPEG, PNG, WebP und MP4 werden unterstützt.',imageLimit:'Maximal 10 Bilder.',videoLimit:'Maximal 3 MP4-Dateien.',duplicateSkipped:'Duplikate übersprungen.',noFiles:'Mindestens eine Datei wählen.',pickFolderFirst:'Zuerst einen Zielordner wählen.',savedFiles:'{count} neue Datei(en) gespeichert.',someFailed:'{done} gespeichert, {failed} fehlgeschlagen.',cancelled:'Verarbeitung abgebrochen.',saveFailed:'Datei konnte nicht gespeichert werden.',processingItem:'{current}/{total} {name}',removeFileLabel:'{name} entfernen',fallbackSave:'Normale Browser-Speicherung wird verwendet.',metaComment:'Kommentare',metaText:'Text / Zeit',metaMp4:'MP4-Metadaten',metaTime:'Erstellungszeit'
    },
    pt: {
      skip:'Ir para a ferramenta',language:'Idioma',navOverview:'Visão geral',navTool:'Ferramenta',navSafety:'Segurança',navGuide:'Especificações',lead:'Mantenha a foto e o vídeo. Remova apenas os dados indesejados.',intro:'Remova GPS, data, dispositivo e mais sem enviar arquivos, criando uma cópia no mesmo formato.',trustLocal:'Sem upload',trustFormat:'Mesmo formato',trustOriginal:'Original intacto',localBadge:'Processado apenas neste dispositivo',toolTitle:'Remover dados e salvar cópia',saveDestination:'Destino',folderUnset:'Não selecionado',chooseFolder:'Escolher pasta',folderNote:'No PC, escolha o destino uma vez e as novas cópias serão gravadas diretamente nele.',folderFallback:'Após processar, será usado o salvamento normal do navegador.',dropTitle:'Solte imagens ou vídeos aqui',dropSub:'ou clique para escolher',limits:'JPEG / PNG / WebP até 10 · MP4 até 3',selectedFiles:'Arquivos escolhidos',clear:'Limpar tudo',processing:'Processando',processButton:'Remover dados e salvar',cancel:'Cancelar',outputNote:'Um clique salva nos downloads padrão: meta_zero.ext / meta_zero_01.ext …',removeHeading:'Dados removidos',removeText:'Local, data, dispositivo, software, comentários e metadados padrão de imagem/MP4.',keepHeading:'Sem alterações',keepText:'Pixels, vídeo/áudio e arquivo original. Cor e orientação necessárias à exibição são mantidas.',noticeHeading:'Suporte e limites',noticeText:'JPEG / PNG / WebP / MP4. Não remove rostos ou endereços visíveis nem o IP da rede.',footer:'Os arquivos permanecem no seu dispositivo.',statusReady:'Pronto',statusScanning:'Lendo',statusProcessing:'Removendo dados',statusDone:'Salvo',statusError:'Falha',metadataFound:'{count} tipo(s) de metadados',metadataNone:'Nenhum metadado removível',folderUnsupported:'Este navegador não grava diretamente em pastas.',folderSelected:'Salvar em: {name}',folderDenied:'Acesso à pasta não concedido.',invalidType:'Apenas JPEG, PNG, WebP e MP4 são aceitos.',imageLimit:'Até 10 imagens.',videoLimit:'Até 3 arquivos MP4.',duplicateSkipped:'Duplicados ignorados.',noFiles:'Escolha pelo menos um arquivo.',pickFolderFirst:'Escolha primeiro uma pasta.',savedFiles:'{count} novo(s) arquivo(s) salvo(s).',someFailed:'{done} salvo(s), {failed} falha(s).',cancelled:'Processamento cancelado.',saveFailed:'Não foi possível salvar o arquivo.',processingItem:'{current}/{total} {name}',removeFileLabel:'Remover {name}',fallbackSave:'Usando o salvamento normal do navegador.',metaComment:'Comentários',metaText:'Texto / data',metaMp4:'Metadados MP4',metaTime:'Data de criação'
    }
  };

  const outputNotes = {
    'zh-CN': '在原文件名后添加 .mz，并逐个保存到默认下载位置。',
    'zh-TW': '在原檔名後加上 .mz，並逐一儲存到預設下載位置。',
    ko: '원래 이름에 .mz를 붙여 기본 다운로드 위치에 하나씩 저장합니다.',
    es: 'Añade .mz al nombre original y guarda los archivos uno por uno en las descargas predeterminadas.',
    fr: 'Ajoute .mz au nom d’origine et enregistre les fichiers un par un dans les téléchargements par défaut.',
    de: 'Fügt .mz an den ursprünglichen Namen an und speichert mehrere Dateien nacheinander im Standard-Downloadordner.',
    pt: 'Adiciona .mz ao nome original e salva os arquivos um por um nos downloads padrão.'
  };
  const audioEnhancements = {
    'zh-CN': { lead:'保留图片、音频和视频，只清除不想留下的信息。',dropTitle:'将图片、音频或视频拖到这里',limits:'JPEG / PNG / WebP 最多10张 · MP3 最多10个 · MP4 / MOV 合计最多3个',removeText:'位置、拍摄时间、设备和软件名称、备注及标准图片、音频和视频元数据。',noticeText:'支持 JPEG / PNG / WebP / MP3 / MP4 / MOV。无法删除画面中的人脸、地址或网络 IP 地址。',specCountValue:'10张图片 / 10个MP3 / MP4与MOV合计3个',invalidType:'仅支持 JPEG、PNG、WebP、MP3、MP4 和 MOV。',videoLimit:'MP4 与 MOV 合计最多可选择3个。',audioLimit:'最多可选择10个 MP3。',metaId3:'ID3 元数据',metaApe:'APE 元数据',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'高功能版 META ZERO 已内置于 KeyCraft。',keycraftText:'进一步扩展图片、音频和视频格式及批量处理功能，并与免费的 Windows 快捷键工具一起使用。',keycraftButton:'在 BOOTH 下载' },
    'zh-TW': { lead:'保留圖片、音訊與影片，只清除不想留下的資訊。',dropTitle:'將圖片、音訊或影片拖到這裡',limits:'JPEG / PNG / WebP 最多10張 · MP3 最多10個 · MP4 / MOV 合計最多3個',removeText:'位置、拍攝時間、裝置與軟體名稱、註解及標準圖片、音訊和影片中繼資料。',noticeText:'支援 JPEG / PNG / WebP / MP3 / MP4 / MOV。無法移除畫面中的人臉、地址或網路 IP 位址。',specCountValue:'10張圖片 / 10個MP3 / MP4與MOV合計3個',invalidType:'僅支援 JPEG、PNG、WebP、MP3、MP4 與 MOV。',videoLimit:'MP4 與 MOV 合計最多可選擇3個。',audioLimit:'最多可選擇10個 MP3。',metaId3:'ID3 中繼資料',metaApe:'APE 中繼資料',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'高功能版 META ZERO 已內建於 KeyCraft。',keycraftText:'進一步擴充圖片、音訊與影片格式及批次處理功能，並與免費的 Windows 快捷鍵工具一起使用。',keycraftButton:'在 BOOTH 下載' },
    ko: { lead:'사진·이미지·음성·영상은 그대로, 남기고 싶지 않은 정보만 지웁니다.',dropTitle:'이미지·음성·영상을 여기에 놓기',limits:'JPEG / PNG / WebP 최대 10장 · MP3 최대 10개 · MP4 / MOV 합계 최대 3개',removeText:'위치, 촬영 시간, 기기·소프트웨어명, 댓글 및 표준 이미지·음성·영상 메타데이터.',noticeText:'JPEG / PNG / WebP / MP3 / MP4 / MOV 지원. 화면 속 얼굴·주소와 네트워크 IP 주소는 지울 수 없습니다.',specCountValue:'이미지 10장 / MP3 10개 / MP4·MOV 합계 3개',invalidType:'JPEG, PNG, WebP, MP3, MP4, MOV만 지원합니다.',videoLimit:'MP4와 MOV는 합계 3개까지 선택할 수 있습니다.',audioLimit:'MP3는 최대 10개까지 선택할 수 있습니다.',metaId3:'ID3 메타데이터',metaApe:'APE 메타데이터',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'고급 META ZERO가 KeyCraft에 탑재되었습니다.',keycraftText:'이미지·음성·영상 형식과 일괄 처리를 더욱 강화한 무료 Windows 단축키 도구입니다.',keycraftButton:'BOOTH에서 다운로드' },
    es: { lead:'Conserva imágenes, audio y vídeos. Elimina solo los datos que no quieres.',dropTitle:'Suelta imágenes, audio o vídeos aquí',limits:'JPEG / PNG / WebP hasta 10 · MP3 hasta 10 · MP4 / MOV hasta 3 en total',removeText:'Ubicación, fecha, dispositivo, software, comentarios y metadatos estándar de imágenes, audio y vídeo.',noticeText:'JPEG / PNG / WebP / MP3 / MP4 / MOV. No elimina caras o direcciones visibles ni la IP de red.',specCountValue:'10 imágenes / 10 MP3 / 3 MP4 o MOV en total',invalidType:'Solo se admite JPEG, PNG, WebP, MP3, MP4 y MOV.',videoLimit:'Puedes elegir hasta 3 archivos MP4 o MOV en total.',audioLimit:'Puedes elegir hasta 10 MP3.',metaId3:'Metadatos ID3',metaApe:'Metadatos APE',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'La versión avanzada de META ZERO está incluida en KeyCraft.',keycraftText:'Más formatos de imagen, audio y vídeo y un procesamiento por lotes reforzado, dentro de una herramienta gratuita de atajos para Windows.',keycraftButton:'Descargar en BOOTH' },
    fr: { lead:'Gardez images, audio et vidéos. Effacez seulement les données indésirables.',dropTitle:'Déposez images, fichiers audio ou vidéos ici',limits:'JPEG / PNG / WebP jusqu’à 10 · MP3 jusqu’à 10 · MP4 / MOV jusqu’à 3 au total',removeText:'Lieu, date, appareil, logiciel, commentaires et métadonnées standard des images, fichiers audio et vidéos.',noticeText:'JPEG / PNG / WebP / MP3 / MP4 / MOV. Les visages ou adresses visibles et l’adresse IP réseau ne sont pas supprimés.',specCountValue:'10 images / 10 MP3 / 3 MP4 ou MOV au total',invalidType:'Seuls JPEG, PNG, WebP, MP3, MP4 et MOV sont acceptés.',videoLimit:'3 fichiers MP4 ou MOV maximum au total.',audioLimit:'10 fichiers MP3 maximum.',metaId3:'Métadonnées ID3',metaApe:'Métadonnées APE',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'La version avancée de META ZERO est intégrée à KeyCraft.',keycraftText:'Davantage de formats image, audio et vidéo et un traitement par lots renforcé, dans un outil gratuit de raccourcis Windows.',keycraftButton:'Télécharger sur BOOTH' },
    de: { lead:'Bilder, Audio und Videos bleiben gleich. Nur unerwünschte Daten werden entfernt.',dropTitle:'Bilder, Audio oder Videos hier ablegen',limits:'JPEG / PNG / WebP bis 10 · MP3 bis 10 · MP4 / MOV zusammen bis 3',removeText:'Ort, Aufnahmezeit, Geräte-/Softwarenamen, Kommentare und übliche Bild-, Audio- und Video-Metadaten.',noticeText:'JPEG / PNG / WebP / MP3 / MP4 / MOV. Sichtbare Gesichter oder Adressen und die Netzwerk-IP werden nicht entfernt.',specCountValue:'10 Bilder / 10 MP3 / zusammen 3 MP4 oder MOV',invalidType:'Nur JPEG, PNG, WebP, MP3, MP4 und MOV werden unterstützt.',videoLimit:'Zusammen maximal 3 MP4- oder MOV-Dateien.',audioLimit:'Maximal 10 MP3-Dateien.',metaId3:'ID3-Metadaten',metaApe:'APE-Metadaten',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'Die erweiterte Version von META ZERO ist in KeyCraft enthalten.',keycraftText:'Mehr Bild-, Audio- und Videoformate sowie stärkere Stapelverarbeitung in einem kostenlosen Windows-Shortcut-Tool.',keycraftButton:'Auf BOOTH herunterladen' },
    pt: { lead:'Mantenha imagens, áudio e vídeos. Remova apenas os dados indesejados.',dropTitle:'Solte imagens, áudio ou vídeos aqui',limits:'JPEG / PNG / WebP até 10 · MP3 até 10 · MP4 / MOV até 3 no total',removeText:'Local, data, dispositivo, software, comentários e metadados padrão de imagem, áudio e vídeo.',noticeText:'JPEG / PNG / WebP / MP3 / MP4 / MOV. Não remove rostos ou endereços visíveis nem o IP da rede.',specCountValue:'10 imagens / 10 MP3 / 3 MP4 ou MOV no total',invalidType:'Apenas JPEG, PNG, WebP, MP3, MP4 e MOV são aceitos.',videoLimit:'Até 3 arquivos MP4 ou MOV no total.',audioLimit:'Até 10 arquivos MP3.',metaId3:'Metadados ID3',metaApe:'Metadados APE',keycraftEyebrow:'WINDOWS APP',keycraftTitle:'A versão avançada do META ZERO está incluída no KeyCraft.',keycraftText:'Mais formatos de imagem, áudio e vídeo e processamento em lote reforçado em uma ferramenta gratuita de atalhos para Windows.',keycraftButton:'Baixar no BOOTH' }
  };
  const privacyEnhancements = {
    'zh-CN': {
      removeText: '删除 GPS 和位置、日期、创作者与用户名、版权、设备、相机与软件名称、可检测的用户、设备与文档 ID、标题、备注、网站名称与 URL、原文件名、IP 地址信息及其他内部元数据。只要是支持的格式，无论文件来自 Canva、Adobe Photoshop、Adobe Premiere Pro 还是其他工具都可以处理。',
      keepText: '图像像素、音频和视频内容及原文件保持不变。保留色彩配置文件和必要的方向信息，避免竖屏或横屏内容旋转或倒置。',
      noticeText: '无法删除图片或视频中出现的人脸、地址、画面文字，以及音频中录制的声音或对话等媒体内容本身的信息，保存后的文件名也会保留。即使是支持的格式，也无法保证完全删除软件专用的非公开区域中无法检测的信息或压缩数据中的编码器标识。',
      networkNotice: '文件内部可检测的 IP 地址信息会被删除，也不会添加到新文件中。但上传目标服务可能在发送时通过访问日志另行获取和管理来源 IP 地址。该信息与文件元数据不同，不属于 META ZERO 的处理和管理范围。',
      metaIpAddress: 'IP 地址'
    },
    'zh-TW': {
      removeText: '移除 GPS 與位置、日期、創作者與使用者名稱、著作權、裝置、相機與軟體名稱、可偵測的使用者、裝置與文件 ID、標題、註解、網站名稱與 URL、原始檔名、IP 位址資訊及其他內部中繼資料。只要是支援的格式，無論檔案來自 Canva、Adobe Photoshop、Adobe Premiere Pro 或其他工具都能處理。',
      keepText: '影像像素、音訊與影片內容及原檔保持不變。保留色彩描述檔與必要的方向資訊，避免直向或橫向內容旋轉或上下顛倒。',
      noticeText: '無法移除圖片或影片中出現的人臉、地址、畫面文字，以及音訊中錄製的聲音或對話等媒體內容本身的資訊，儲存後的檔名也會保留。即使是支援的格式，也無法保證完全移除軟體專用的非公開區域中無法偵測的資訊或壓縮資料中的編碼器識別資訊。',
      networkNotice: '檔案內部可偵測的 IP 位址資訊會被移除，也不會加入新檔案。但上傳目的地服務可能在傳送時透過存取日誌另行取得和管理來源 IP 位址。該資訊與檔案中繼資料不同，不屬於 META ZERO 的處理與管理範圍。',
      metaIpAddress: 'IP 位址'
    },
    ko: {
      removeText: 'GPS·위치, 날짜, 작성자·사용자명, 저작권, 기기·카메라·소프트웨어명, 감지 가능한 사용자·기기·문서 ID, 제목·댓글, 사이트 이름·URL, 원본 파일명, IP 주소 정보와 기타 내부 메타데이터를 제거합니다. Canva, Adobe Photoshop, Adobe Premiere Pro 등 제작 도구와 관계없이 지원 형식을 처리합니다.',
      keepText: '이미지 픽셀, 음성·영상 데이터와 원본 파일은 변경하지 않습니다. 세로·가로 이미지와 영상이 회전되거나 거꾸로 표시되지 않도록 필요한 방향 정보와 색상 프로파일은 유지합니다.',
      noticeText: '이미지·영상에 보이는 얼굴, 주소, 화면 속 글자와 음성에 녹음된 목소리·대화처럼 미디어 자체에 포함된 정보와 저장 후 파일명은 제거할 수 없습니다. 지원 형식이라도 소프트웨어 전용 비공개 영역의 감지할 수 없는 정보나 압축 데이터의 인코더 식별자를 완전히 제거한다고 보장할 수 없습니다.',
      networkNotice: '파일 내부의 감지 가능한 IP 주소 정보는 제거하며 새 파일에도 추가하지 않습니다. 다만 업로드 대상 서비스가 전송 시 접속 로그 등을 통해 출발지 IP 주소를 별도로 수집·관리할 수 있습니다. 이는 파일 메타데이터와 다른 정보이며 META ZERO의 처리·관리 대상이 아닙니다.',
      metaIpAddress: 'IP 주소'
    },
    es: {
      removeText: 'Se eliminan GPS y ubicación, fechas, autor y usuario, copyright, dispositivo, cámara y software, ID detectables de usuario, dispositivo y documento, títulos, comentarios, nombres y URL de sitios, nombre original, datos de IP y otros metadatos internos. Los formatos compatibles se procesan aunque procedan de Canva, Adobe Photoshop, Adobe Premiere Pro u otra herramienta.',
      keepText: 'Los píxeles de imagen, el contenido de audio/vídeo y los archivos originales no se modifican. Se conservan los perfiles de color y los datos de orientación necesarios para evitar que el contenido vertical u horizontal aparezca girado o invertido.',
      noticeText: 'No se puede eliminar información contenida en el propio contenido, como caras, direcciones o texto visibles en imágenes o vídeos, ni voces o conversaciones grabadas en audio. El nombre guardado también permanece. Incluso en formatos compatibles, no se garantiza la eliminación completa de información indetectable en áreas privadas de cada software ni de identificadores del codificador incluidos en datos comprimidos.',
      networkNotice: 'Los datos de dirección IP detectables dentro del archivo se eliminan y no se añaden al archivo nuevo. El servicio de destino puede obtener y gestionar por separado la IP de origen mediante registros de acceso durante el envío. Esa información es distinta de los metadatos del archivo y está fuera del procesamiento y control de META ZERO.',
      metaIpAddress: 'DIRECCIÓN IP'
    },
    fr: {
      removeText: 'Les données GPS et de localisation, dates, auteur et utilisateur, droits d’auteur, appareil, caméra et logiciel, identifiants détectables d’utilisateur, d’appareil et de document, titres, commentaires, noms et URL de sites, nom d’origine, données d’adresse IP et autres métadonnées internes sont supprimés. Les formats pris en charge sont traités qu’ils proviennent de Canva, Adobe Photoshop, Adobe Premiere Pro ou d’un autre outil.',
      keepText: 'Les pixels, le contenu audio/vidéo et les fichiers originaux restent inchangés. Les profils colorimétriques et les données d’orientation nécessaires pour éviter qu’un contenu portrait ou paysage apparaisse tourné ou à l’envers sont conservés.',
      noticeText: 'Les informations présentes dans le contenu lui-même, comme les visages, adresses ou textes visibles dans les images ou vidéos, ainsi que les voix ou conversations enregistrées dans l’audio, ne peuvent pas être supprimées. Le nom enregistré reste également. Même pour les formats pris en charge, la suppression complète des informations indétectables dans des zones privées propres aux logiciels ou des identifiants d’encodeur intégrés aux données compressées n’est pas garantie.',
      networkNotice: 'Les données d’adresse IP détectables à l’intérieur du fichier sont supprimées et ne sont pas ajoutées au nouveau fichier. Le service de destination peut collecter et gérer séparément l’adresse IP source dans ses journaux d’accès lors de l’envoi. Cette information est distincte des métadonnées du fichier et échappe au traitement et au contrôle de META ZERO.',
      metaIpAddress: 'ADRESSE IP'
    },
    de: {
      removeText: 'GPS und Standort, Datum, Urheber- und Benutzername, Copyright, Geräte-, Kamera- und Softwarename, erkennbare Benutzer-, Geräte- und Dokument-IDs, Titel, Kommentare, Website-Namen und -URLs, ursprünglicher Dateiname, IP-Adressdaten und andere interne Metadaten werden entfernt. Unterstützte Formate werden unabhängig davon verarbeitet, ob sie aus Canva, Adobe Photoshop, Adobe Premiere Pro oder einem anderen Werkzeug stammen.',
      keepText: 'Bildpixel, Audio-/Videoinhalte und Originaldateien bleiben unverändert. Farbprofile und Ausrichtungsdaten, die verhindern, dass Hoch- oder Querformat gedreht oder auf dem Kopf angezeigt wird, bleiben erhalten.',
      noticeText: 'Informationen im Medieninhalt selbst, etwa Gesichter, Adressen oder Text in Bildern und Videos sowie Stimmen oder Gespräche in Audioaufnahmen, können nicht entfernt werden. Auch der gespeicherte Dateiname bleibt bestehen. Selbst bei unterstützten Formaten kann die vollständige Entfernung nicht erkennbarer Informationen in privaten softwarespezifischen Bereichen oder von Encoder-Kennungen in komprimierten Daten nicht garantiert werden.',
      networkNotice: 'Erkennbare IP-Adressdaten innerhalb der Datei werden entfernt und nicht zur neuen Datei hinzugefügt. Der Zieldienst kann die Quell-IP beim Senden separat über Zugriffsprotokolle erfassen und verwalten. Diese Information ist von Dateimetadaten getrennt und liegt außerhalb der Verarbeitung und Kontrolle von META ZERO.',
      metaIpAddress: 'IP-ADRESSE'
    },
    pt: {
      removeText: 'São removidos GPS e localização, datas, autor e usuário, direitos autorais, dispositivo, câmera e software, IDs detectáveis de usuário, dispositivo e documento, títulos, comentários, nomes e URLs de sites, nome original, dados de IP e outros metadados internos. Os formatos compatíveis são processados mesmo que venham do Canva, Adobe Photoshop, Adobe Premiere Pro ou outra ferramenta.',
      keepText: 'Os pixels, o conteúdo de áudio/vídeo e os arquivos originais permanecem inalterados. Perfis de cor e dados de orientação necessários para evitar que conteúdos verticais ou horizontais apareçam girados ou de cabeça para baixo são mantidos.',
      noticeText: 'Informações presentes no próprio conteúdo, como rostos, endereços ou textos visíveis em imagens ou vídeos e vozes ou conversas gravadas em áudio, não podem ser removidas. O nome salvo também permanece. Mesmo em formatos compatíveis, não é garantida a remoção completa de informações não detectáveis em áreas privadas específicas do software nem de identificadores do codificador presentes em dados compactados.',
      networkNotice: 'Os dados de endereço IP detectáveis dentro do arquivo são removidos e não são adicionados ao novo arquivo. O serviço de destino pode obter e gerenciar separadamente o IP de origem por meio de logs de acesso durante o envio. Essa informação é diferente dos metadados do arquivo e está fora do processamento e controle do META ZERO.',
      metaIpAddress: 'ENDEREÇO IP'
    }
  };
  const metadataFoundDetails = {
    'zh-CN': '发现 {count} 类元数据（{targets}）',
    'zh-TW': '發現 {count} 類中繼資料（{targets}）',
    ko: '제거 대상 {count}종 ({targets})',
    es: '{count} tipo(s) de metadatos ({targets})',
    fr: '{count} type(s) de métadonnées ({targets})',
    de: '{count} Metadatentyp(en) ({targets})',
    pt: '{count} tipo(s) de metadados ({targets})'
  };
  const backToTopLabels = {
    'zh-CN': '返回顶部',
    'zh-TW': '返回頂部',
    ko: '맨 위로',
    es: 'Volver arriba',
    fr: 'Retour en haut',
    de: 'Nach oben',
    pt: 'Voltar ao topo'
  };
  const tables = { en, ja };
  Object.entries(overrides).forEach(([language, values]) => {
    tables[language] = { ...en, ...values, ...audioEnhancements[language], ...(privacyEnhancements[language] || {}), outputNote: outputNotes[language] || en.outputNote, metadataFound: metadataFoundDetails[language] || en.metadataFound, backToTop: backToTopLabels[language] || en.backToTop };
  });
  const supported = Object.keys(tables);

  function normalize(value) {
    if (!value) return 'en';
    if (value.toLowerCase().startsWith('zh-tw') || value.toLowerCase().startsWith('zh-hk')) return 'zh-TW';
    if (value.toLowerCase().startsWith('zh')) return 'zh-CN';
    const short = value.toLowerCase().split('-')[0];
    return supported.find(item => item.toLowerCase() === short) || 'en';
  }

  function loadLanguage() {
    try { return localStorage.getItem('metaZeroLanguage'); }
    catch { return null; }
  }
  function saveLanguage(value) {
    try { localStorage.setItem('metaZeroLanguage', value); }
    catch {}
  }

  let language = normalize(loadLanguage() || navigator.language || 'ja');
  function t(key, variables = {}) {
    const source = tables[language]?.[key] ?? en[key] ?? key;
    return String(source).replace(/\{(\w+)\}/g, (_, name) => variables[name] ?? '');
  }
  function apply() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
    const select = document.getElementById('languageSelect');
    if (select) select.value = language;
  }
  function setLanguage(next) {
    language = normalize(next);
    saveLanguage(language);
    apply();
    window.dispatchEvent(new CustomEvent('metazero:languagechange'));
  }
  window.MetaZeroI18n = { t, apply, setLanguage, getLanguage: () => language };
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('languageSelect')?.addEventListener('change', event => setLanguage(event.target.value));
  });
})();
