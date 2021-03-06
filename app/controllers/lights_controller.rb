class LightsController < ApplicationController
	def change_logger
		@@change_logger ||= Logger.new("#{Rails.root}/log/change.log")
	end

#Creates sites
	def index
		@lights = Huey::Bulb.all
	end

	def edit
    @light = Huey::Bulb.find(params[:id])
		for light in @lights
			light.set_state({
				:hue => [0,12750,36210,46920,56100].sample,
				:saturation => 254
				}, 0)
		end
	end


	def new
		#@lights.sample.set_state({
		#	:hue => [0,12750,36210,46920,56100].sample,
		#	:saturation => 255}, 0)
		redirect_to(:action => 'index')
	end


	def create
    @lights = Huey::Bulb.all

		if (params[:newhue0].to_i != 0) then
			if (params[:newsat0].to_i != 0) then
				@lights[params[:id].to_i-1].update(hue: params[:newhue0].to_i,
                                         sat: params[:newsat0].to_i)
         # {
				#:hue => params[:newhue0].to_i,
				#:sat => params[:newsat0].to_i})
			else
				@lights[params[:id].to_i-1].set_state({
				:hue => params[:newhue0].to_i}, 0)
			end
		else
			if (params[:newsat0].to_i != 0) then
				@lights[params[:id].to_i-1].set_state({
				:saturation => params[:newsat0].to_i}, 0)

			end
		end

		redirect_to(:action => 'index')
	end
#Changes lights
	def multi_update
		lights = params[:lights].keys

		@changedLights = ""

		lights.each do |light|
			bulb = Huey::Bulb.find light.to_i
			bulb.update(sat: (params[:sat]).to_i, hue: (params[:hue].to_i), bri: (params[:bri].to_i))
			bulb.save
			@changedLights += light.to_s+" "
		end
		@lights = Huey::Bulb.all
		respond_to do |format|
			format.js
		end
		log("Lamps ##{@changedLights}color changed to #{(params[:rgb][:color]).to_s}")
	end
#shows a specific lamp (lights/1)
	def show
		render plain: params[:id]
	end
#Set standard light
	def reset_lights
		lights = Huey::Bulb.all

		lights.each do |light|
			light.update(rgb: '#cff974', bri: 200)
			light.save
		end

		respond_to do |format|
			format.js
		end
		log("All lamps reset")
	end

	def turnOff
		@light = Huey::Bulb.find(params[:id].to_i)
		@light.update(on: false)
		@light.save
		redirect_to(:action => 'index')
	end

	def turnOn
		@light = Huey::Bulb.find(params[:id].to_i)
		@light.update(on: true)
		@light.save
		redirect_to(:action => 'index')
	end

	def turn_all_off
		lights_group = Huey::Group.new(Huey::Bulb.find(1),Huey::Bulb.find(2),Huey::Bulb.find(3),
			Huey::Bulb.find(4), Huey::Bulb.find(5), Huey::Bulb.find(6))

		lights_group.update(on: false, bri: 200, transitiontime: 0)

		@lights = Huey::Bulb.all
		respond_to do |format|
			format.js
		end
		log("All lights OFF")
	end

	def turn_all_on
		lights_group = Huey::Group.new(Huey::Bulb.find(1),Huey::Bulb.find(2),Huey::Bulb.find(3),
			Huey::Bulb.find(4), Huey::Bulb.find(5), Huey::Bulb.find(6))

		lights_group.update(on: true, bri: 200, transitiontime: 0)

		@lights = Huey::Bulb.all
		respond_to do |format|
			format.js
		end
		log("All lights ON")
	end
#Toggles light state
	def switchOnOff
		@light = Huey::Bulb.find(params[:id].to_i)
		@light.on = !@light.on
		@light.save
		log("Lamp ##{params[:id]} toggled")
	end
	def log(change)
		entry = LogEntry.new
		@user = User.find_by_token cookies[:chalmersItAuth]
		entry.cid = @user.cid
		entry.change = change
		entry.save
	end
end
