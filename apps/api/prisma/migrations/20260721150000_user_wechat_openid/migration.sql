-- Add wechatOpenId to User for WeChat mini-program login
ALTER TABLE "User" ADD COLUMN "wechatOpenId" TEXT;
CREATE UNIQUE INDEX "User_wechatOpenId_key" ON "User"("wechatOpenId");
