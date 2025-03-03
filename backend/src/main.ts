import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new IoAdapter(app)); 
  await app.listen(process.env.PORT ?? 3001);
  console.log("Backend running on http://localhost:3001");
  console.log("✅ WebSocket listening at ws://localhost:3001/socket.io/");
}
bootstrap();
