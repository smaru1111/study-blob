// ./src/azure-storage-blob.ts

// <snippet_package>
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const containerName = `uploaded`;
const sasToken = process.env.REACT_APP_AZURE_STORAGE_SAS_TOKEN;
const storageAccountName = process.env.REACT_APP_AZURE_STORAGE_RESOURCE_NAME;
// </snippet_package>

// <snippet_get_client>
const uploadUrl = `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`;
console.log(uploadUrl);

// get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
const blobService = new BlobServiceClient(uploadUrl);

// get Container - full public read access
const containerClient: ContainerClient =
  blobService.getContainerClient(containerName);


// 機能フラグ - 設定されていない場合は、アプリにストレージ機能を無効にします
export const isStorageConfigured = () => {
  return !storageAccountName || !sasToken ? false : true;
};

// 表示するコンテナのblobのリストを返す。
export const getBlobsInContainer = async () => {
  const returnedBlobUrls = [];

  // コンテナ内のblobのリストを取得する。
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log(`${blob.name}`);

    const blobItem = {
      url: `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}?${sasToken}`,
      name: blob.name
    }

    // イメージが公開されている場合は、URLを構築するだけ
    returnedBlobUrls.push(blobItem);
  }

  return returnedBlobUrls;
};

const createBlobInContainer = async (file: File) => {
  // blobコンテナ用のblobClientを作成
  // パラメータとして、blobclientの名前を指定
  const blobClient = containerClient.getBlockBlobClient(file.name);
  // ファイルアップロードコントロールでブラウザーから決定されたtypeを設定
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // ファイルをアップロードする
  await blobClient.uploadData(file, options);
};

const uploadFileToBlob = async (file: File | null): Promise<void> => {
  if (!file) return;
  // ファイルをアップロードする
  await createBlobInContainer(file);
};

export default uploadFileToBlob;
